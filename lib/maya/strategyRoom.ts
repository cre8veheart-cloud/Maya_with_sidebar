import { createChatProviderStream } from "./chatProviders";
import { buildExecSystemPrompt } from "./execLens";
import type { ExecRole, MayaProvider } from "./types";

const MAX_PERSPECTIVE_CHARS = 12000;
const MAX_SYNTHESIS_CHARS = 16000;
const MAX_CONCURRENT_EXECUTIVES = 4;

export interface StrategyRoomPerspective {
  role: ExecRole;
  response: string;
}

export interface StrategyRoomResult {
  perspectives: StrategyRoomPerspective[];
  synthesis: string;
  warnings?: string[];
}

async function collectStream(
  stream: AsyncGenerator<string>,
  maxChars: number,
): Promise<string> {
  let output = "";
  for await (const chunk of stream) {
    if (!chunk) continue;
    const remaining = maxChars - output.length;
    if (remaining <= 0) break;
    output += chunk.slice(0, remaining);
  }
  return output.trim();
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<Array<PromiseSettledResult<R>>> {
  const results: Array<PromiseSettledResult<R>> = new Array(items.length);
  let nextIndex = 0;

  async function runner() {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      try {
        results[index] = { status: "fulfilled", value: await worker(items[index]) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runner()),
  );
  return results;
}

function buildRolePrompt(role: ExecRole, prompt: string): string {
  return [
    `You are contributing the ${role.toUpperCase()} perspective inside MAYA's Strategy Room.`,
    "Give an independent executive recommendation from your function's point of view.",
    "Do not average toward consensus. Surface your strongest recommendation, key evidence/assumptions, and the most important risk.",
    "Do not claim that actions were executed.",
    "",
    `FOUNDER QUESTION: ${prompt}`,
  ].join("\n");
}

function buildMayaSynthesisPrompt(prompt: string, perspectives: StrategyRoomPerspective[]): string {
  const evidence = perspectives
    .map(({ role, response }) => `${role.toUpperCase()} PERSPECTIVE:\n${response}`)
    .join("\n\n---\n\n");

  return [
    "You are MAYA, the adjudicating intelligence for a multi-agent executive decision system.",
    "Your job is not to summarize or average the executives. Evaluate their competing reasoning and choose the strongest path.",
    "Explicitly identify meaningful disagreements and reject weaker paths when warranted.",
    "Return a decisive, practical answer using these headings:",
    "Decision",
    "Why this wins",
    "Rejected / secondary paths",
    "Risks and assumptions",
    "Next moves",
    "Recovery path",
    "Never claim an external action occurred unless evidence in the prompt says it did.",
    "",
    `FOUNDER QUESTION: ${prompt}`,
    "",
    "EXECUTIVE PERSPECTIVES:",
    evidence,
  ].join("\n");
}

export async function runStrategyRoom({
  roles,
  prompt,
  provider,
  model,
  ludicrousMode,
}: {
  roles: ExecRole[];
  prompt: string;
  provider: MayaProvider;
  model?: string;
  ludicrousMode?: boolean;
}): Promise<StrategyRoomResult> {
  const settled = await mapWithConcurrency(
    roles,
    MAX_CONCURRENT_EXECUTIVES,
    async (role): Promise<StrategyRoomPerspective> => {
      const stream = await createChatProviderStream({
        provider,
        messages: [{ role: "user", content: buildRolePrompt(role, prompt) }],
        systemPrompt: buildExecSystemPrompt(role),
        execContextMessage: null,
        model,
        ludicrousMode,
        useGeminiAdvisory: false,
      });

      const response = await collectStream(stream, MAX_PERSPECTIVE_CHARS);
      if (!response) throw new Error(`${role.toUpperCase()} returned no response`);
      return { role, response };
    },
  );

  const perspectives = settled
    .filter((result): result is PromiseFulfilledResult<StrategyRoomPerspective> => result.status === "fulfilled")
    .map((result) => result.value);

  const warnings = settled.flatMap((result, index) => {
    if (result.status === "fulfilled") return [];
    const role = roles[index]?.toUpperCase() || "EXECUTIVE";
    return [`${role} perspective unavailable`];
  });

  if (perspectives.length < 2) {
    throw new Error("Strategy Room could not obtain enough independent executive perspectives");
  }

  const synthesisStream = await createChatProviderStream({
    provider,
    messages: [{ role: "user", content: buildMayaSynthesisPrompt(prompt, perspectives) }],
    systemPrompt: [
      "You are MAYA, the orchestration and adjudication layer for an executive decision platform.",
      "Select the strongest reasoning path rather than averaging viewpoints.",
      "Be concise, explicit about tradeoffs, and action-oriented.",
    ].join(" "),
    execContextMessage: null,
    model,
    ludicrousMode,
    useGeminiAdvisory: false,
  });

  const synthesis = await collectStream(synthesisStream, MAX_SYNTHESIS_CHARS);
  if (!synthesis) throw new Error("MAYA adjudication returned no response");

  return {
    perspectives,
    synthesis,
    ...(warnings.length ? { warnings } : {}),
  };
}
