import { readFileSync } from "node:fs";

const profileRoute = readFileSync("app/api/user/profile/route.ts", "utf8");
const lensRoute = readFileSync("app/api/user/lens/route.ts", "utf8");
const vault = readFileSync("lib/storage/userVault.ts", "utf8");
const supabase = readFileSync("lib/supabase/server.ts", "utf8");
const migration = readFileSync(
  "supabase/migrations/20260831020000_persistent_user_vault.sql",
  "utf8",
);

for (const [name, source] of [
  ["profile route", profileRoute],
  ["lens route", lensRoute],
]) {
  if (!source.includes("requireBetaSession")) {
    throw new Error(`${name} does not enforce the beta-session boundary`);
  }
  if (!source.includes('"Cache-Control": "no-store"')) {
    throw new Error(`${name} can be cached`);
  }
  if (!source.includes("STORAGE_ERROR")) {
    throw new Error(`${name} does not fail safely when storage is unavailable`);
  }
}

if (!profileRoute.includes("inviteCodes: []")) {
  throw new Error("Profile route may persist invite authentication material");
}
if (!vault.includes('import "server-only"')) {
  throw new Error("Persistent user vault is not server-only");
}
if (!supabase.includes("SUPABASE_SERVICE_ROLE_KEY")) {
  throw new Error("Supabase server credential is missing");
}
if (supabase.includes("NEXT_PUBLIC_SUPABASE_SERVICE")) {
  throw new Error("Supabase service credential is exposed to the browser");
}
if (!migration.includes("enable row level security")) {
  throw new Error("Persistent user vault tables do not enable RLS");
}
if (!migration.includes("revoke all")) {
  throw new Error("Persistent user vault tables remain browser-accessible");
}

console.log("Persistent workspace profile and lens boundary verified.");
