import { NextRequest } from "next/server";
import {
  buildCommunityContextMessage,
  buildCommunitySystemPrompt,
  type CommunityAssistantContext,
} from "@/lib/maya/communityPrompt";
import {
  buildExecContextMessage,
  buildExecSystemPrompt,
  type ExecProfile,
} from "@/lib/maya/execLens";
import { createChatProviderStream } from "@/lib/maya/chatProviders";
import type {
  ExecRole,
  RoleLens,
  MayaMessage,
  MayaProvider,
} from "@/lib/maya/types";

type ChatWorkspace = "exec" | "community";

const VALID_ROLES = new Set<ExecRole>([
  "ceo", "coo", "cmo", "cfo", "cto", "cio", "cro", "cd", "admin", "hr", "legal",
]);
const VALID_PROVIDERS = new Set<MayaProvider>(["anthropic", "openclaw", "openai"]);

function sanitizeText(raw: unknown, maxLen: number): string {
  if (typeof raw !== "string") return "";
  return raw.slice(0, maxLen).replace(/[\x00-\x1f\x7f]/g, " ").trim();
}

function parseLens(raw: unknown): RoleLens {
  if (!raw || typeof raw !== "object") throw new Error("Invalid lens");
  const { role, overrides } = raw as Record<string, unknown>;

  if (typeof role !== "string" || !VALID_ROLES.has(role as ExecRole)) {
    throw new Error("Invalid role");
  }

  const safeOverrides = Array.isArray(overrides)
    ? overrides
        .filter(
          (o): o is { key: string; value: string } =>
            !!o &&
            typeof o === "object" &&
            typeof (o as Record<string, unknown>).key === "string" &&
            typeof (o as Record<string, unknown>).value === "string",
        )
        .slice(0, 50)
        .map((o) => ({
          key: sanitizeText(o.key, 100),
          value: sanitizeText(o.value, 500),
        }))
        .filter((o) => o.key.length > 0)
    : [];

  return { role: role as ExecRole, overrides: safeOverrides };
}

function parseWorkspace(raw: unknown): ChatWorkspace {
  return raw === "community" ? "community" : "exec";
}

function parseMessages(raw: unknown): MayaMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is { role: string; content: string } =>
        !!m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-100)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: sanitizeText(m.content, 8000),
    }));
}

function parseProfile(raw: unknown): ExecProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  if (typeof p.name !== "string" || typeof p.title !== "string") return null;
  return {
    name: sanitizeText(p.name, 100),
    title: sanitizeText(p.title, 100),
    company: sanitizeText(p.company, 100),
    industry: sanitizeText(p.industry, 100),
  };
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

function parseModel(raw: unknown): string {
  return sanitizeText(raw, 100);
}

function parseLudicrousMode(raw: unknown): boolean {
  return raw === true;
}

function parseCommunityContext(raw: unknown): CommunityAssistantContext | null {
  if (!raw || typeof raw !== "object") return null;
  const context = raw as Record<string, unknown>;
  return {
    selectedTopic: sanitizeText(context.selectedTopic, 120),
    activeFilter: sanitizeText(context.activeFilter, 50),
    summary: sanitizeText(context.summary, 2000),
  };
}

export async function POST(req: NextRequest) {

  let workspace: ChatWorkspace;
  let lens: RoleLens;
  let messages: MayaMessage[];
  let profile: ExecProfile | null;
  let provider: MayaProvider;
  let model: string;
  let ludicrousMode: boolean;
  let communityContext: CommunityAssistantContext | null;

  try {
    const body = await req.json();
    workspace = parseWorkspace(body.workspace);
    lens = workspace === "community" ? { role: "cmo", overrides: [] } : parseLens(body.lens);
    messages = parseMessages(body.messages);
    profile = parseProfile(body.profile);
    provider = parseProvider(workspace === "community" ? body.provider : undefined);
    model = parseModel(workspace === "community" ? body.model : undefined);
    ludicrousMode = parseLudicrousMode(
      workspace === "community" ? body.ludicrousMode : undefined,
    );
    communityContext = parseCommunityContext(body.communityContext);
  } catch {
    return Response.json(
      { error: "Invalid request body", code: "INVALID_REQUEST" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return Response.json(
      { error: "A user message is required", code: "MESSAGE_REQUIRED" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const systemPrompt = workspace === "community" ? buildCommunitySystemPrompt() : buildExecSystemPrompt(lens.role);
  const execContextMessage = workspace === "community"
    ? buildCommunityContextMessage(communityContext)
    : buildExecContextMessage(lens, profile);

  let stream: AsyncGenerator<string>;
  try {
    stream = await createChatProviderStream({
      provider,
      messages,
      systemPrompt,
      execContextMessage,
      model,
      ludicrousMode,
      useGeminiAdvisory: workspace === "exec",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provider configuration error";
    return Response.json(
      { error: message, code: "PROVIDER_ERROR" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let streamedAny = false;
      try {
        for await (const chunk of stream) {
          if (chunk) streamedAny = true;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        console.error("Maya chat stream failed", error);
        const detail = error instanceof Error ? error.message : "The provider stopped responding.";
        const prefix = streamedAny ? "\n\n" : "";
        controller.enqueue(encoder.encode(`${prefix}[MAYA] The response could not be completed: ${detail}`));
      } finally {
        controller.close();
      }
    },
  });

  const headers = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });

  return new Response(readable, { headers });
}
