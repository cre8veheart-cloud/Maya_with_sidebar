import { readFileSync } from "node:fs";

const lifecycle = readFileSync("lib/maya/sessionLifecycle.ts", "utf8");
const client = readFileSync("lib/maya/sessionLifecycleClient.ts", "utf8");
const route = readFileSync("app/api/sessions/route.ts", "utf8");
const storage = readFileSync("lib/storage/sessionVault.ts", "utf8");
const migration = readFileSync(
  "supabase/migrations/20260831220000_automatic_session_closeouts.sql",
  "utf8",
);
const roleChat = readFileSync("components/RoleChat.tsx", "utf8");
const sessionsPage = readFileSync("app/library/sessions/page.tsx", "utf8");

if (!lifecycle.includes("MAYA_SESSION_INACTIVITY_MINUTES = 45")) {
  throw new Error("MAYA session inactivity rule is not 45 minutes");
}
for (const field of [
  "whatChanged",
  "keyDecisions",
  "unresolvedBlockers",
  "securityOrDeploymentIssues",
  "nextAction",
]) {
  if (!lifecycle.includes(field)) {
    throw new Error(`Closeout field missing: ${field}`);
  }
}
if (!client.includes('send(snapshot, "close")')) {
  throw new Error("Automatic closeout timer is not wired");
}
if (!route.includes("requireBetaSession")) {
  throw new Error("Session API does not enforce authentication");
}
if (!route.includes("closeStale")) {
  throw new Error("Server-side stale session recovery is missing");
}
for (const boundary of ["workspace_id", "client_vault_id"]) {
  if (!storage.includes(boundary) || !migration.includes(boundary)) {
    throw new Error(`Session isolation boundary missing: ${boundary}`);
  }
}
if (!migration.includes("enable row level security")) {
  throw new Error("Session table does not enable RLS");
}
if (!migration.includes("revoke all")) {
  throw new Error("Session table remains browser-accessible");
}
if (!roleChat.includes("checkpointPocketOfficeSession")) {
  throw new Error("Executive workspaces do not checkpoint sessions");
}
if (!sessionsPage.includes("MAYA automatic closeout")) {
  throw new Error("Sessions library does not expose closeouts");
}

console.log("MAYA automatic session closeout gate verified.");
