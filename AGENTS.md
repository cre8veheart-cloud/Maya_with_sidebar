# MAYA Engineering Instructions

This repository is the source code for MAYA. Treat it as a production application, not a playground.

## Living MAYA blueprint — REQUIRED

Before planning, architecture, implementation, review, testing, deployment, product interpretation, menu work, memory work, executive work, client-vault work, or merge decisions, every assistant or engineering agent must read and apply:

`docs/MAYA_ARCHITECTURE_BLUEPRINT_V1.md`

Rules:
- The blueprint on `main` is the living, active, amendable MAYA build authority.
- State which blueprint section(s) govern the task before making substantive changes.
- Every PR must identify the blueprint section it implements, preserves, or proposes to amend.
- Founder-approved architectural decisions must be added to the blueprint on `main`; they must not remain only in chat, comments, transferred summaries, or feature branches.
- A stale PR description, old branch, bot summary, or legacy implementation cannot override the current blueprint.
- If code, a request, or another instruction conflicts with the blueprint, disclose the conflict and follow the Founder's newest explicit decision. Update the blueprint in the same change when practical; an outdated repository document is not an automatic stop condition.
- Mechanical tasks may be scoped narrowly, but they may not redefine MAYA architecture implicitly.
- Completion reports must state whether the work conforms to the blueprint and identify any unresolved gap.
- Exact trigger **DIH EVENT MAYA** requires reading the blueprint from `main` and presenting its Current Working Checkpoint before substantive work.
- At the end of substantive MAYA work, update the Current Working Checkpoint with the verified stop point and exact first next action.
- Append a Work History Trail entry with evidence, changes, result, blocker and relevant PR/branch/commit/deployment identifiers.
- The history trail is append-only. Correct prior entries with a new entry; never silently rewrite or delete completed history.
- Record all substantive work: successful changes, failures, exact errors, attempted fixes, failed fixes, verified fixes, regressions, rollbacks, reversals, removals and unresolved debt.
- Link failures to fixes and fixes to post-fix verification evidence.
- Use VERIFIED, CONTRADICTED, UNVERIFIED and UNKNOWN classifications; never convert a claim into proof merely because a build or check is green.
- A later fix does not erase the failed attempt that led to it.
- Apply founder-approved blueprint amendments before dependent implementation. Remove superseded rules from the active design and record the replacement in Amendment History.

## Source of truth

- `main` is the only production source branch.
- Do not commit directly to `main` unless explicitly instructed by the acting CTO/founder workflow.
- Use a focused feature/fix branch and a pull request for every engineering change.
- Do not deploy a non-`main` branch to production.

## Founder-authorized production rule — REQUIRED

This rule applies to every engineering agent, including Ari/Codex, Claude, Copilot, and later agents.

- Agents may inspect the repository, create an approved non-production branch, edit files, run tests, and open or update pull requests without separate merge permission.
- No agent may merge a pull request into `main`, promote or trigger production, or invoke a production deployment unless Founder Leslie explicitly authorizes that exact current PR head after its latest commit.
- The live, enforced mechanism for that authorization is the `founder-exact-head-approval` GitHub Actions check (`.github/workflows/founder-exact-head-approval.yml` / `scripts/founder-exact-head-approval.mjs`): a PR comment reading exactly `APPROVE <head_sha>`, posted by GitHub user `cre8veheart-ai`, after the PR's latest commit. A PR is not mergeable until this check passes — no chat instruction, agent-side judgment, or other repository-local claim substitutes for it.
- Claude, Ari/Codex, Copilot, and later collaborators operate under the same rule; repository-local instructions must not create provider-specific bypasses of this gate.
- Any commit added after an `APPROVE <sha>` comment invalidates that authorization. A fresh `APPROVE <new_sha>` comment is required for the new head.
- Preview deployments may run from pull-request branches. Only an authorized merge to `main` may trigger the production path.
- Founder authorization never permits bypassing failing required checks, exposing secrets, or weakening the zero-access client-vault boundary.

## Required validation

Before a pull request is considered mergeable, run:

```bash
npm ci
npm run verify
```

`npm run verify` must pass lint, focused verification scripts, and the production build.

Do not bypass failing checks, weaken lint rules, or remove tests merely to make CI green.

## Architecture rules

- MAYA is the orchestration/intelligence platform, not an executive persona.
- Executive roles are separate conversational specialists.
- `/api/chat` is a protected server boundary and must fail safely.
- Keep provider credentials, session secrets, Redis credentials, OAuth secrets, and tokens server-only.
- Never hard-code secrets, copy live credentials into source, or commit `.env*` files containing real values.
- Preserve explicit human approval for external actions.
- Prefer small, reversible changes over broad rewrites.

## Product rules

- A session is the persistent working surface for user activity.
- Multiple executives may participate in one session.
- Executive provider/model routing remains internal unless product direction explicitly changes it.
- MAYA settings control orchestration and intelligence modes.
- Do not reintroduce password/beta gates, provider selectors, or internal engineering controls into user-facing executive chat without explicit approval.

## Vercel

Canonical project: `maya-with-sidebar` under team `mayav11`.

- Preview deployments may come from PR branches.
- Production must come from `main` only.
- Treat `maya-with-sidebar-kkha` and `maya-with-sidebar-wgvu` as duplicate legacy projects until they are removed from Vercel.

## Engineering discipline

- Read the existing implementation before modifying it.
- Preserve working behavior unless the task explicitly requires a behavioral change.
- Report assumptions and unresolved production risks in the PR description.
- Never merge a failing PR.
- Never use Copilot-generated legacy branches as architectural authority.
- If requirements conflict with this file, disclose the conflict and follow the Founder's newest explicit decision. Do not treat this file as authority above the Founder.
