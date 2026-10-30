import type { ExecRole, MayaMessage } from "./types";

export const MAYA_SESSION_INACTIVITY_MINUTES = 45;
export const MAYA_SESSION_INACTIVITY_MS =
  MAYA_SESSION_INACTIVITY_MINUTES * 60 * 1000;

export type MayaSessionStatus = "active" | "closed" | "auto_closed";

export interface MayaSessionCloseout {
  whatChanged: string[];
  keyDecisions: string[];
  unresolvedBlockers: string[];
  securityOrDeploymentIssues: string[];
  nextAction: string;
  generatedAt: string;
  generatedBy: "maya";
}

export interface MayaPocketOfficeSession {
  id: string;
  clientVaultId: string;
  role: ExecRole | "strategy-room";
  title: string;
  transcript: MayaMessage[];
  status: MayaSessionStatus;
  lastActivityAt: string;
  closedAt?: string | null;
  closeout?: MayaSessionCloseout | null;
}

function compact(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 320);
}

function sentences(messages: MayaMessage[]): string[] {
  return messages
    .flatMap((message) => message.content.split(/\n+|(?<=[.!?])\s+/))
    .map(compact)
    .filter((value) => value.length >= 8);
}

function select(items: string[], pattern: RegExp, limit = 4): string[] {
  const matches = items.filter((item) => pattern.test(item));
  return [...new Set(matches)].slice(-limit);
}

function orNone(items: string[]): string[] {
  return items.length > 0 ? items : ["None recorded."];
}

export function buildMayaSessionCloseout(
  transcript: MayaMessage[],
  now = new Date(),
): MayaSessionCloseout {
  const all = sentences(transcript);
  const assistant = sentences(
    transcript.filter((message) => message.role === "assistant"),
  );
  const user = sentences(
    transcript.filter((message) => message.role === "user"),
  );

  const whatChanged = select(
    assistant,
    /\b(add(?:ed)?|built|chang(?:ed)?|configur(?:ed)?|creat(?:ed)?|deploy(?:ed)?|fix(?:ed)?|implement(?:ed)?|remov(?:ed)?|sav(?:ed)?|updat(?:ed)?|wir(?:ed)?)\b/i,
  );
  const keyDecisions = select(
    all,
    /\b(agreed|approved|chose|chosen|decid(?:e|ed)|locked|must|selected|will use)\b/i,
  );
  const unresolvedBlockers = select(
    all,
    /\b(block(?:ed|er)?|cannot|can't|error|fail(?:ed|ing)?|missing|pending|risk|unresolved)\b/i,
  );
  const securityOrDeploymentIssues = select(
    all,
    /\b(auth(?:entication|orization)?|branch|deploy(?:ment|ed)?|permission|pull request|secret|security|supabase|vercel)\b/i,
  );

  const nextAction =
    [...all]
      .reverse()
      .find((item) =>
        /\b(exact next|next action|next step|proceed|restart|resume|verify|test|implement|build|deploy)\b/i.test(
          item,
        ),
      ) ??
    user.at(-1) ??
    "Open the saved session and continue from the latest completed response.";

  return {
    whatChanged: orNone(whatChanged),
    keyDecisions: orNone(keyDecisions),
    unresolvedBlockers: orNone(unresolvedBlockers),
    securityOrDeploymentIssues: orNone(securityOrDeploymentIssues),
    nextAction: compact(nextAction),
    generatedAt: now.toISOString(),
    generatedBy: "maya",
  };
}
