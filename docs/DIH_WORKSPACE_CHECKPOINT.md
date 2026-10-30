# DIH CODING WORKSPACE CHECKPOINT

## Latest recovery checkpoint — 2026-10-30

Use this section before the preserved historical checkpoint below. Verify current
remote state before acting; a recovery phrase does not establish authentication
or imply that a deployment or source recovery succeeded.

- Priority: recover the newer Maya11 source, then migrate to Cloudflare and
  verify it before considering Vercel cancellation.
- Recovery repository: `cre8veheart-cloud/Maya_with_sidebar`, draft PR #4,
  branch `feat/gallery-website-workspace`. The application code baseline is
  `92c32c1e986cb3dc1beb3f88465da94e45c6c796`; this checkpoint update changes docs only.
  Verify the latest PR head rather than treating that baseline as the current head.
- `main` remains the placeholder `12f73b4b3a5e3bf6179061e63c7ded038bdf68d9`.
  The candidate is not merged, deployed, or established as the latest Maya11.
- New recovery lead: the user's October 23 evidence log reports main commit
  `d08e8d163f75b5f8fbb3f4e6319cb7cf37d71432`, PR #209, and canonical Vercel
  deployment `dpl_5WMd9zWS5DzUZZgeagZAT11YLC2f`. Neither accessible GitHub
  recovery repository contained that commit when checked. The log is a lead,
  not independently recovered source or proof of working production features.
- Reproduced candidate defects: the custom approval check rejects owner
  `cre8veheart-cloud` because it recognizes only `cre8veheart-ai`; the default
  repository allowlist excludes the recovery repository when overrides are unset;
  protected product features require a beta-session cookie but no application
  issuance route was found. These are not verified findings about the newer build.
- Preserve the existing fix that retains GitHub sessions on `403`.
  GitHub access to the recovery repository has administrator permission.
- Vercel API authentication previously failed; do not repeat unchanged credential
  requests or claim migration is complete. No provider credentials were changed.
- Latest detailed session record:
  https://app.notion.com/p/MAYA-Session-Log-40915ea41da4812ebc54c779df539c89
- First next action: retrieve that record, verify the current PR/head and source
  access, then continue recovery of the newer source. Do not resume the historical
  Supabase build package below or substitute the old archive for latest Maya11.
- DIH is an agent recovery protocol, not a full transcript archive. State what
  was actually retrieved and identify missing context rather than inventing it.

## Historical checkpoint — 2026-08-31 (preserved)

Status: Active handoff
Recorded: 2026-08-31 UTC
Owner: Leslie / Founder
Technical lead: Ari / Acting CTO

## Activation

Canonical phrase: **DIH EVENT MAYA**

The phrase is a workspace recovery shortcut. It does not alter application authentication or authorization.

## Canonical coordinates

| Surface | Canonical target |
| --- | --- |
| GitHub | `cre8veheart-ai/Maya_with_sidebar` |
| Visibility | Private |
| Production branch | `main` |
| Vercel team | `mayav11` |
| Vercel project | `maya-with-sidebar` |
| Production commit | `2dd925765687630c3b242fd519ad4321d6a44422` |
| Production state | READY |
| Full verification | `npm ci && npm run verify` |

## Verified workspace authority

The connected GitHub workspace has admin, maintain, pull, push, and triage permission for the canonical repository. Use repository permissions as authorization evidence; do not treat the DIH phrase itself as authorization.

## Executive roster

| Executive | Role |
| --- | --- |
| Max | CEO |
| Erica | CMO |
| Dana | CFO |
| Ari | CTO |
| Sam | COO |
| Unnamed | Executive Assistant |

MAYA is the orchestration and intelligence platform, not an executive persona.

## Hard boundaries

- `main` is the only production source branch.
- Use a focused branch and pull request for changes.
- Production deploys originate from `main` only.
- Keep credentials and secrets server-only.
- `/api/chat` remains protected by an authorized beta session.
- External actions require explicit human approval.
- Do not use Copilot legacy branches as architectural authority.
- Do not create duplicate repositories or shadow production projects.
- Do not claim a change passed until the complete verification suite provides evidence.

## Current build edge

Completed:
- Max / CEO standalone chassis and adversarial evaluation gates
- Ari / CTO standalone operating clone and delivery command center
- Erica / CMO and Dana / CFO chassis gates
- CEO + CTO adjudication fixtures
- Security, beta-hardening, and permissions verification
- Protected beta session boundary for `/api/chat`
- Canonical private repository and canonical Vercel project

Production limitation still visible in `README.md`:
- Profiles, sessions, executive work, saved activity, documents, vaults, campaigns, and connector state are not yet durably persisted through server APIs.

## Next build package

**Persistent Workspace Foundation**

1. Define a server-owned persistence contract.
2. Implement authenticated `/api/user/*` routes used by the existing cloud storage adapter.
3. Persist profiles, named sessions, executive participation, messages, and saved activity.
4. Keep invite/session controls in their existing security boundary.
5. Place durable memory/vault storage behind an adapter suitable for Supabase.
6. Add migration-safe schemas and verification gates.
7. Merge only after `npm run verify` and preview verification pass.

## Resume sequence

On the next **DIH EVENT MAYA**:
1. Read `AGENTS.md`.
2. Read `docs/MAYA_SESSION_PROTOCOL.md`.
3. Read this checkpoint.
4. Confirm current `main`, open PRs, and latest production deployment.
5. Continue the Persistent Workspace Foundation unless Leslie changes direction.
