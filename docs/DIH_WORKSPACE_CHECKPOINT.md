# DIH CODING WORKSPACE CHECKPOINT

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
