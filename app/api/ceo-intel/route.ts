import { NextRequest } from "next/server";
import { createChatProviderStream } from "@/lib/maya/chatProviders";
import {
  buildFallbackIntelSynthesis,
  buildHardenedIntelContext,
  retrieveHardenedIntel,
} from "@/lib/maya/hardenedIntel";
import type { MayaProvider, RoleLens } from "@/lib/maya/types";

const VALID_PROVIDERS = new Set<MayaProvider>(["anthropic", "openclaw"]);

function sanitizeText(raw: unknown, maxLen: number): string {
  if (typeof raw !== "string") return "";
  return raw.slice(0, maxLen).replace(/[\x00-\x1f\x7f]/g, " ").trim();
}

function parseProvider(raw: unknown): MayaProvider {
  if (typeof raw === "string" && VALID_PROVIDERS.has(raw as MayaProvider)) {
    return raw as MayaProvider;
  }

  const envProvider = sanitizeText(process.env.MAYA_PROVIDER, 20);
  if (VALID_PROVIDERS.has(envProvider as MayaProvider)) {
    return envProvider as MayaProvider;
  }

  return "anthropic";
}

function parseLudicrousMode(raw: unknown): boolean {
  return raw === true;
}

function parseLens(raw: unknown): RoleLens {
  if (!raw || typeof raw !== "object") return { role: "ceo", overrides: [] };
  const overrides = Array.isArray((raw as { overrides?: unknown[] }).overrides)
    ? (raw as { overrides: unknown[] }).overrides
        .filter(
          (item): item is { key: string; value: string } =>
            !!item &&
            typeof item === "object" &&
            typeof (item as Record<string, unknown>).key === "string" &&
            typeof (item as Record<string, unknown>).value === "string"
        )
        .slice(0, 20)
        .map((item) => ({
          key: sanitizeText(item.key, 100),
          value: sanitizeText(item.value, 300),
        }))
        .filter((item) => item.key.length > 0)
    : [];

  return { role: "ceo", overrides };
}

async function consumeStream(stream: AsyncGenerator<string>): Promise<string> {
  let output = "";
  for await (const chunk of stream) output += chunk;
  return output.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const query = sanitizeText(body.query, 2000);

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const provider = parseProvider(body.provider);
    const model = sanitizeText(body.model, 100);
    const ludicrousMode = parseLudicrousMode(body.ludicrousMode);
    const lens = parseLens(body.lens);
    const sources = retrieveHardenedIntel(query, "ceo");
    const intelContext = buildHardenedIntelContext(query, sources, lens);

    let answer = "";
    let mode: "provider-synthesis" | "fallback-synthesis" = "fallback-synthesis";

    try {
      const stream = await createChatProviderStream({
        provider,
        model,
        ludicrousMode,
        messages: [
          {
            role: "user",
            content: [
              "Use MAYA hardened intel first.",
              "Answer only from the supplied internal evidence.",
              "If support is weak or missing, say so plainly.",
              "Return sections: Recommendation, Why it matters, Evidence from MAYA, Watchpoints, Next move.",
              `CEO question: ${query}`,
            ].join("\n"),
          },
        ],
        systemPrompt: [
          "You are MAYA's hardened CEO intelligence layer.",
          "You are not a generic chatbot and not a freeform executive roleplay agent.",
          "Your primary job is to synthesize retrieved MAYA internal intelligence.",
          "Treat the hardened intel source pack as the source of truth.",
          "Do not invent sources, decisions, or org facts that are not in the provided evidence.",
        ].join("\n"),
        execContextMessage: intelContext,
      });

      answer = await consumeStream(stream);
      mode = "provider-synthesis";
    } catch {
      answer = buildFallbackIntelSynthesis(query, sources);
    }

    return new Response(
      JSON.stringify({
        answer,
        mode,
        sources: sources.map((source) => ({
          id: source.id,
          source: source.source,
          title: source.title,
          summary: source.summary,
          content: source.content,
          updatedAt: source.updatedAt,
          confidence: source.confidence,
          tags: source.tags,
        })),
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
