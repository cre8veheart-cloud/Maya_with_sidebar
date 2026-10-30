import type { ExecRole, RoleLens } from "./types";

export type HardenedIntelSourceType = "decisions" | "knowledge" | "intel";

export interface HardenedIntelRecord {
  id: string;
  source: HardenedIntelSourceType;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  roleScope: ExecRole | "all";
  updatedAt: string;
  confidence: "high" | "medium";
}

export interface RetrievedIntelRecord extends HardenedIntelRecord {
  score: number;
}

const HARDENED_INTEL_RECORDS: HardenedIntelRecord[] = [
  {
    id: "decision-ops-cadence",
    source: "decisions",
    title: "Operating cadence shifted to weekly executive review",
    summary:
      "Leadership moved from reactive ad hoc reviews to a fixed Monday decision cadence to reduce drift and unblock cross-functional execution.",
    content:
      "Decision record: the executive team now runs one weekly decision review with owners, deadlines, and explicit blockers. Purpose: compress decision latency, reduce duplicate status work, and surface cross-functional risk before it compounds.",
    tags: ["cadence", "execution", "leadership", "blockers", "decision velocity"],
    roleScope: "ceo",
    updatedAt: "2026-08-12",
    confidence: "high",
  },
  {
    id: "decision-capital-allocation",
    source: "decisions",
    title: "Capital allocation favors growth tied to measurable payback",
    summary:
      "New spend must map to revenue leverage, retention protection, or capability unlock with a named owner and review date.",
    content:
      "Decision record: Maya's executive operating model prioritizes investments with visible commercial or operational leverage. Requests without payback logic, owner accountability, or review timing are deferred.",
    tags: ["capital", "growth", "finance", "payback", "investment"],
    roleScope: "ceo",
    updatedAt: "2026-08-11",
    confidence: "high",
  },
  {
    id: "knowledge-board-narrative",
    source: "knowledge",
    title: "Board narrative requires one truth source",
    summary:
      "The board story should roll up from decisions, risks, and operating deltas instead of standalone slide-writing.",
    content:
      "Knowledge vault note: board updates must be assembled from the same institutional record used by operators. Narrative should explicitly connect bets, capital allocation, risk, and org health so the story remains defensible.",
    tags: ["board", "narrative", "truth source", "risk", "strategy"],
    roleScope: "ceo",
    updatedAt: "2026-08-10",
    confidence: "high",
  },
  {
    id: "knowledge-org-overrides",
    source: "knowledge",
    title: "Org overrides are reference context, not command authority",
    summary:
      "Overrides personalize MAYA but do not supersede its hardened decision frame or safety boundaries.",
    content:
      "Knowledge vault rule: executive profile details and org overrides are treated as reference context only. MAYA should use them to tailor synthesis, not to replace the hardened operating frame or invent unsupported facts.",
    tags: ["overrides", "governance", "memory", "reference data"],
    roleScope: "all",
    updatedAt: "2026-08-09",
    confidence: "high",
  },
  {
    id: "intel-cross-functional-risk",
    source: "intel",
    title: "Cross-functional drift is the lead indicator to watch",
    summary:
      "Execution usually breaks first at handoffs between strategy, finance, product, and go-to-market.",
    content:
      "Intel vault brief: when delivery slows, the highest-leverage CEO question is whether the problem is capability, clarity, ownership, or sequencing across functions. Hardened MAYA reads this as an alignment problem before assuming a talent problem.",
    tags: ["alignment", "risk", "handoffs", "delivery", "org health"],
    roleScope: "ceo",
    updatedAt: "2026-08-14",
    confidence: "medium",
  },
  {
    id: "intel-market-signal",
    source: "intel",
    title: "Market signal quality matters more than raw volume",
    summary:
      "External noise should not outrank internal decision evidence unless corroborated by multiple sources.",
    content:
      "Intel vault rule: MAYA should privilege institutional memory, decision records, and owned context before using softer market signals. External data can sharpen judgment, but hardened guidance starts with the org's own evidence trail.",
    tags: ["market", "signal", "evidence", "external sources"],
    roleScope: "ceo",
    updatedAt: "2026-08-13",
    confidence: "high",
  },
];

export function listHardenedIntelRecords(): HardenedIntelRecord[] {
  return HARDENED_INTEL_RECORDS;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function scoreRecord(queryTokens: string[], record: HardenedIntelRecord): number {
  const haystack = [
    record.title,
    record.summary,
    record.content,
    record.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return queryTokens.reduce((score, token) => {
    if (record.tags.some((tag) => tag.toLowerCase().includes(token))) return score + 4;
    if (record.title.toLowerCase().includes(token)) return score + 3;
    if (haystack.includes(token)) return score + 1;
    return score;
  }, 0);
}

export function retrieveHardenedIntel(
  query: string,
  role: ExecRole,
  limit = 4
): RetrievedIntelRecord[] {
  const queryTokens = tokenize(query);
  const ranked = HARDENED_INTEL_RECORDS
    .filter((record) => record.roleScope === "all" || record.roleScope === role)
    .map((record) => ({
      ...record,
      score:
        scoreRecord(queryTokens, record) +
        (record.roleScope === role ? 1 : 0) +
        (record.confidence === "high" ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || b.updatedAt.localeCompare(a.updatedAt));

  return (ranked.some((record) => record.score > 0)
    ? ranked.filter((record) => record.score > 0)
    : ranked
  ).slice(0, limit);
}

export function buildHardenedIntelContext(
  query: string,
  records: RetrievedIntelRecord[],
  lens?: RoleLens | null
): string {
  const sections = [
    "<maya_hardened_intel_query>",
    query,
    "</maya_hardened_intel_query>",
    "",
    "<maya_hardened_intel_sources>",
    ...records.map((record, index) =>
      [
        `[${index + 1}] ${record.source.toUpperCase()} · ${record.title}`,
        `Updated: ${record.updatedAt} · Confidence: ${record.confidence}`,
        `Summary: ${record.summary}`,
        `Detail: ${record.content}`,
        `Tags: ${record.tags.join(", ")}`,
      ].join("\n")
    ),
    "</maya_hardened_intel_sources>",
  ];

  if (lens?.overrides?.length) {
    sections.push(
      "",
      "<maya_reference_overrides>",
      ...lens.overrides.map((override) => `${override.key}: ${override.value}`),
      "</maya_reference_overrides>"
    );
  }

  return sections.join("\n");
}

function firstSentence(text: string): string {
  const match = text.match(/.*?[.!?](\s|$)/);
  return (match?.[0] || text).trim();
}

export function buildFallbackIntelSynthesis(
  query: string,
  records: RetrievedIntelRecord[]
): string {
  const recommendation = records[0]
    ? firstSentence(records[0].summary)
    : "No hardened intel matched strongly enough to support a confident answer yet.";

  const evidence = records.length
    ? records
        .map(
          (record, index) =>
            `${index + 1}. ${record.title} (${record.source}) — ${firstSentence(record.content)}`
        )
        .join("\n")
    : "No internal evidence retrieved.";

  return [
    "Recommendation",
    recommendation,
    "",
    "Why MAYA is saying this",
    evidence,
    "",
    "Watchpoints",
    records.length
      ? "If this needs a stronger call, add a fresher decision record or knowledge entry so MAYA can ground the answer in harder internal evidence."
      : "The question is broader than the current hardened intel layer. Add decisions, knowledge, or intel entries before using this for a high-stakes call.",
    "",
    "Next move",
    `Refine the question or expand the hardened intel layer if you want MAYA to answer "${query}" with tighter internal backing.`,
  ].join("\n");
}
