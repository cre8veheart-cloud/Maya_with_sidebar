# MAYA Engineering Notes & History

Status: Working engineering reference and audit history — descriptive, not independently binding policy.
Owner: Leslie (Founder) — sole final authority over MAYA product and engineering direction.
Maintained by: Ari, under Founder direction, subject to review and correction at any time.
Repository rule: One canonical private Maya repository. No duplicate repos or shadow deployments.

## What this document is

This file is the engineering audit trail for MAYA: what was built, what was tried, what failed, what was decided, and why. It is a record, not a source of authority in itself. The only sources of binding authority over engineering work are:

1. Leslie's explicit, current direction (in conversation or via GitHub's ordinary review/approval controls).
2. `AGENTS.md`, which states the actual operating rules for every engineering agent (Claude, Ari/Codex, Copilot, and later collaborators).

No document — including this one — may claim to override, gate, or supersede those two things. A stale entry in this history, an old decision recorded here, or language elsewhere describing this file as "build authority" does not carry force on its own.

## Split from the original blueprint (2026-09-22)

This file used to be combined with product/feature roadmap content (planned executives, shared services, Whiteboard Room, Maya Live, Art Gallery, menu structure, build order, and similar forward-looking design) under the title "Maya Architecture Blueprint v1.0," with a header describing it as "Living, active and amendable MAYA build authority." Leslie identified that framing as a problem: the document was intended to capture Pocket Office build-capability planning, not to function as binding policy gating every agent's work — and the escalation to "build authority" language (commit `079a6ec`, 2026-09-01) had not been reviewed on its own terms; it rode in alongside legitimate Pocket Office architecture work in the same commit.

As a result:
- The roadmap/planning content has moved to `docs/MAYA_POCKET_OFFICE_ROADMAP.md`, explicitly marked non-binding.
- This file keeps the engineering history, the Preapproved Tool Register, and the Claude/Ari/Copilot access-control history, reframed as reference rather than authority.
- A stale, superseded checkpoint snapshot from 2026-09-02 ("What we were building" / "Where work stopped" / "First next action", referring to the long-since-resolved PR #96 Pocket Desk work) was removed rather than carried forward, since the Amendment protocol below already calls for removing superseded content and the current Active Engineering-Control Checkpoint elsewhere in this file supersedes it.

## Blueprint governance

- Founder Leslie is the final project authority. GitHub is repository infrastructure, not a deciding or policy-enforcement authority over Founder-authorized work.
- This document, `AGENTS.md`, and any repository workflow, bot or agent instruction may warn, document risk and request clarification, but may not silently cancel or indefinitely stop the Founder's explicit authorization.
- This document reflects the current understanding of what has been built and decided. It is not a historical artifact to be quietly rewritten, but it is also not authority in itself — see "What this document is" above.
- Founder-approved decisions are recorded here as they are made.
- A stale PR description, transferred summary or older plan cannot override Leslie's current explicit direction.
- Changes must remain readable in repository history and must not be buried only in comments, chats or feature branches.
- The Current Working Checkpoint should be refreshed before ending substantive MAYA work so **DIH EVENT MAYA** can resume accurately.
- When implementation and this record conflict, disclose the conflict and follow Leslie's newest explicit decision.

## Preapproved Tool Register

This register authorizes categories, not unlimited access. Every actual addition, upgrade, configuration change or removal still receives a dated Work History entry with the affected PR, commit and deployment.

### Preapproved for autonomous use within existing MAYA authority

| Tool/category | Permitted purpose | Boundary | Verification | Removal/rollback |
|---|---|---|---|---|
| GitHub repository tools | Inspect, branch, commit, open/update/close PRs and maintain documentation in the canonical MAYA repository | No new repositories, broad permission changes, secrets or destructive history rewrites | Diff, status, checks and resulting commit/PR state | Revert scoped commit or close unmerged PR |
| Canonical Vercel project tools | Inspect configuration, builds, logs, previews and production state; deploy/redeploy approved MAYA changes | Existing `maya-with-sidebar` project only; no new paid resource or credential | Build result plus browser/capability test; READY alone is insufficient | Roll back to last verified deployment |
| Next.js, React, TypeScript and Tailwind | Implement and repair the existing application stack | Stay compatible with the canonical repository and blueprint | Typecheck, lint, tests, build and browser verification as applicable | Revert dependency/code change |
| Local build, lint and test tooling | Diagnose, format, typecheck, test and reproduce failures | No client production data or secret extraction | Record exact command, output and capability test | Remove temporary tooling/config or revert commit |
| Browser and API verification | Test user flows, routes, responsive behavior and API boundaries | Use approved test state; never expose client-vault plaintext | Screenshot/log evidence plus expected-versus-actual result | Stop test session and remove temporary test artifacts |
| Official documentation and web research | Compare implementation options and verify current platform behavior | Read-only research; claims remain sourced and evidence-labelled | Link authoritative source and record decision impact | No persistent dependency unless separately adopted |
| Built-in document, diagram and image tools | Produce blueprints, specifications, UI references and build artifacts | No external publishing or client-data disclosure | Review generated artifact against request | Delete or supersede artifact through recorded change |
| Reversible open-source packages | Add a narrowly scoped package when needed for an approved feature or test | No telemetry, new account, paid plan, secret, client-data transfer or material architecture shift | Dependency audit, build/test and runtime capability test | Remove package, lockfile change and dependent code |

### Founder decision required before use

- Any new credential, OAuth grant, account registration or broadened permission.
- Any paid plan, usage commitment or service likely to create material cost.
- Any external service receiving client data, user memory, prompts, files or analytics.
- Authentication, encryption, key management, database, vault-storage or recovery architecture changes.
- New AI/model providers that receive MAYA or client context.
- External sending, publishing, financial execution or repository-administration authority.
- Destructive or difficult-to-reverse operations.
- Any tool that materially changes MAYA's product direction or zero-access promise.

### Tool-entry template

Each adopted tool or material version change must record: UTC date; tool/version; purpose; blueprint requirement; permissions; data accessed; sign-in and cost impact; files/services changed; PR/commit/deployment; expected behavior; test performed; actual result; errors and regressions; attempted fixes; final verification; rollback/removal steps; current status (`ACTIVE`, `REMOVED`, `ROLLED BACK`, `BLOCKED` or `SUPERSEDED`).

### Candidate Tool Watchlist

This is the discovery queue for tools not yet known or adopted. A candidate may be added whenever research or implementation exposes a useful capability. Listing is not installation, endorsement, connection or proof.

Candidate statuses:
- `CANDIDATE` — potentially useful; not yet evaluated.
- `RESEARCHING` — documentation, permissions, costs and alternatives under review.
- `TRIAL` — reversible isolated test in progress; no production/client data unless separately approved.
- `REJECTED` — unsuitable; retain the reason so it is not repeatedly reconsidered.
- `PROMOTED` — adopted and moved into the active tool history with full verification and rollback record.

Each candidate entry must state:
- Tool/provider and capability it might supply
- MAYA problem or future trigger it could address
- Existing built-in/current-stack alternative
- Expected permissions, sign-in, cost and data exposure
- Zero-access/client-vault compatibility
- Lock-in and removal risk
- What evidence would justify a trial
- Current status and dated disposition

Discovery rule: use the most direct built-in or already-connected capability first. Search for a new plugin or provider only when a concrete MAYA need would materially benefit. Never claim a candidate is installed, connected or functional without verification.

Initial candidate categories (providers intentionally undecided):
- Durable workflow/retry engine for reliable session filing and closeout
- Client-side cryptography/key-recovery library suitable for zero-access vaults
- Portable encrypted export/manifest verifier
- Error monitoring with strict redaction and no client plaintext
- End-to-end browser testing for Pocket Desk and multi-client isolation
- Accessibility and mobile regression testing
- Dependency/security scanning without repository administration authority
- Offline/local-first synchronization conflict testing


## Current Working Checkpoint

Last updated: 2026-09-21 UTC
Update authority: Founder-approved working state
Resume phrase: **DIH EVENT MAYA**

### Active engineering-control checkpoint

- PR #135 (approval-gate false-failure fix) is VERIFIED merged to `main` (commit `95fb9c5`); the `issue_comment`-from-bots false-failure is resolved in production.
- PR #134 (founder-continuity removal + chat provider error hardening) is VERIFIED merged to `main` (commit `29eaf68`) and VERIFIED live in production on both the canonical `maya-with-sidebar` and legacy `maya-claude-mcp` Vercel projects.
- `main` also carries PR #139 (Adobe connector authorization links) and PR #141 (Copilot repo-scan pass), both merged after #134/#135.
- Audit finding, this session: `AGENTS.md`'s "Founder-authorized production rule" still carried PR #123's looser language ("no exact-comment syntax required"), which is stale relative to the `founder-exact-head-approval` GitHub Actions gate actually installed by PR #133 and still enforcing on every PR. A full revert of PR #123 was evaluated and rejected — most of what #123 removed turned out to be genuine bug fixes (GitHub repo-allowlist fail-open bug, session killed on non-401 errors) or security improvements (credential-leak audit) or duplicate infrastructure (`services/claude-mcp`, duplicate Vercel Action workflows) that should stay removed.
- Change made in this branch: rewrote the `AGENTS.md` rule to name the live `founder-exact-head-approval.yml` / `APPROVE <head_sha>` mechanism explicitly, instead of the superseded looser text. No code, workflow, or runtime behavior changed — documentation-only correction.
- Exact first next action: PR #142 is open with `npm run verify` VERIFIED passing on head `fa6a6aec27e440ec523c2a22078a58eede4a154b`; wait for Leslie's `APPROVE fa6a6aec27e440ec523c2a22078a58eede4a154b` comment to clear the `founder-exact-head-approval` check, then merge.


### Resume protocol

When **DIH EVENT MAYA** is invoked:

1. Read this living blueprint from `main`.
2. Present this Current Working Checkpoint before proposing or taking substantive action.
3. Verify the referenced PR, branch, deployment and blocker against live platform state.
4. Continue from **First next action** unless the founder amends direction.
5. Update this checkpoint before ending substantive MAYA work.

### Amendment protocol

- Founder-approved amendments are written into the active blueprint before dependent implementation continues.
- Superseded requirements are removed from the active design so agents cannot follow stale instructions.
- Material deletions or replacements are summarized in the Amendment History below.
- PR descriptions, code comments and implementation documents are then synchronized to the amended blueprint.
- Reversible tooling changes within existing authority may be implemented autonomously, but each must be logged here before or alongside implementation. The entry must state what it replaces or adds, why it is needed, what data it can access, sign-in/permission and cost impact, failure modes, rollback/removal path and verification gate. Ask the Founder first when new credentials, payment, client-data exposure, destructive action or a material product-direction choice is involved.
- A work session is not considered closed until the checkpoint states the verified stop point and first next action.

## Work History Trail

This trail is append-only. The Current Working Checkpoint may be rewritten to show the latest resume state, but completed history entries must not be silently edited or deleted. Corrections are added as new entries referencing the corrected entry.

Each substantive MAYA work session must append:

- UTC date/time
- Trigger or task
- Blueprint sections used or amended
- Live evidence checked
- Changes made
- Verified result
- Stop reason or remaining blocker
- Exact first next action
- Relevant PR, branch, commit and deployment links or identifiers
- Failures, exact error evidence and affected boundary
- Every attempted fix, including unsuccessful attempts
- The fix that resolved the failure, or why it remains unresolved
- Verification performed after each fix
- Regressions introduced or discovered
- Rollbacks, reversals, removals and superseded approaches
- Follow-up debt, owner and next verification gate

Failure-record rules:
- Never rewrite a failed attempt as if it succeeded.
- Never delete a failure because a later fix worked.
- Link each fix to the failure it addresses and each verification to the exact fix tested.
- Distinguish VERIFIED, CONTRADICTED, UNVERIFIED and UNKNOWN claims.
- Builds, green checks, comments and status summaries are not proof of runtime behavior without the required capability test.
- If a fix fails, append the result and next attempt; do not overwrite the prior entry.
- Security, data-isolation, persistence and deployment failures remain visible permanently, including their containment and final resolution.

### 2026-09-02 — PR #64 disposition

- Trigger: DIH EVENT MAYA / finish the PR #64 blocker.
- Evidence: GitHub reported PR #64 open but `mergeable_state: dirty`; current `main` had advanced 33 commits; canonical Vercel production for PR #95 commit `dd86a3f` was READY.
- Change: Added an evidence comment and closed PR #64 without merging.
- Result: Obsolete integration branch safely retired; no conflict merge performed.
- Next: Continue from current mainline rather than PR #64.

### 2026-09-02 — Pocket Office client-vault architecture

- Trigger: Founder clarified MAYA access, client registration, vault isolation, Pocket Desk behavior and menu configuration.
- Blueprint sections amended: Shared Services / Client Vaults; Current Working Checkpoint.
- Evidence: PR #88 used a server-owned Supabase service-role path capable of plaintext access.
- Changes: Blocked that implementation from merge; specified zero-access client-side encryption, ciphertext-only storage, General/user memory, isolated selected-client context, multiple active clients, greyed-out menu names, complete MAYA availability after one client sign-in, closeout, off-site transfer, portability and erasure.
- Result: Product architecture recorded; safe implementation remains incomplete.
- Stop reason: PR #88 is stale/non-mergeable and its storage design conflicts with the zero-access blueprint.
- First next action: Reconcile PR #88 with current `main`, replace server-readable storage with a ciphertext-only design, then implement and verify the Client menu/Pocket Desk contract.

### 2026-09-02 — Founder-first tooling and change-control rule

- Trigger: Founder required that potentially better build tools or necessary architecture changes be brought forward before use and written into the blueprint so later errors can be traced.
- Blueprint sections amended: Blueprint governance; Amendment protocol.
- Change: Prohibited unapproved introduction or replacement of tools, providers, plug-ins, connectors, frameworks and material architecture dependencies.
- Required decision record: purpose, alternatives/tradeoffs, permissions and data access, sign-in impact, failure modes, rollback/removal path, and capability verification.
- Result: APPROVED process rule is active. Research and recommendations are allowed; adoption or connection waits for Founder approval and blueprint entry.
- Failure-trace rule: all implementation errors, failed fixes, regressions and reversals must reference the approving blueprint entry and affected PR/commit/deployment.
- First next action: apply this gate before changing PR #88's encryption/storage approach or adding any supporting dependency.

### 2026-09-02 — Correction: autonomous, traceable tooling authority

- Trigger: Founder clarified that useful tools may be implemented without asking first; the essential requirement is a complete traceable record.
- Corrects: the earlier 2026-09-02 “Founder-first tooling and change-control rule.”
- Active rule: CTO may autonomously add, replace or remove reversible task-relevant tooling within existing authority.
- Mandatory record: purpose, affected boundary, permissions, data access, sign-in and cost impact, PR/commit/deployment, expected test, actual result, errors, attempted fixes, verification and rollback/removal path.
- Founder decision still required before: obtaining or repurposing credentials, accepting payment/cost commitments, exposing client data, destructive or difficult-to-reverse action, or changing material product direction.
- Result: APPROVED amendment recorded. The earlier approval-first wording is superseded and must not govern future routine tooling work.
- First next action: apply this trace-first rule to all tooling used while rebuilding PR #88.

### 2026-09-02 — Initial preapproved-tool register

- Trigger: Founder authorized creation of a preapproved-tool list.
- Blueprint sections amended: Preapproved Tool Register.
- Change: Preapproved routine use of the existing GitHub/Vercel/application stack, local verification tooling, browser/API testing, authoritative research, build-artifact tools and narrowly scoped reversible open-source packages.
- Guardrail: new credentials, costs, client-data transfers, authentication/encryption/storage changes, AI providers, external authority, destructive actions and material product changes still require Founder decision.
- Result: APPROVED register created. This does not install or connect any new external service.
- Verification: blueprint contains explicit purpose, boundary, verification and rollback requirements for each preapproved category.
- First next action: log each actual tool adoption or change against the template while continuing PR #88.

### 2026-09-02 — Candidate-tool watchlist clarification

- Trigger: Founder clarified that the register should also capture tools that may become useful before their exact need or suitability is known.
- Blueprint sections amended: Preapproved Tool Register / Candidate Tool Watchlist.
- Change: Added evidence-labelled discovery statuses and an evaluation template; seeded capability categories relevant to current MAYA risks without selecting providers.
- Result: APPROVED discovery queue created. No candidate was installed, connected or granted access.
- Guardrail: candidates are not treated as working tools; promotion requires a concrete need, boundary review, trace entry and capability verification.
- First next action: evaluate candidates only when a MAYA build requirement or failure creates a concrete trigger.

### 2026-09-02 — PR #88 retired; PR #96 Pocket Desk foundation opened

- Trigger: Founder directed the MAYA build to proceed.
- Blueprint sections used: Current Working Checkpoint; Client Vaults; Core Menu; Permission Rules; Preapproved Tool Register.
- Live evidence: PR #88 was open, `mergeable: false`, `mergeable_state: dirty`, based on stale main, and contained the contradicted server-readable Supabase path.
- Change: Closed PR #88 without merge and labelled it a blocked design record. Created `maya-pocket-desk-context-v1` from current `main` and opened PR #96.
- PR #96 implementation: added a visible `Workspace: General` Pocket Desk control above all tools, an explicit no-client-context state and a Client Workspaces page.
- Security containment: Add/Register remains disabled; no password, key, client record, local fake vault, database table or storage path was introduced.
- Result: PARTIALLY VERIFIED. GitHub `npm run verify`, preview workflow and Vercel Preview Comments all completed successfully for head `124d9847`; browser/mobile capability verification remains pending.
- Failure/reversal record: PR #88 could not be safely reconciled as implementation because it was dirty and architecturally contradicted; replacement-from-main was chosen rather than preserving the unsafe path.
- Rollback: close PR #96 without merge; no production or client data is affected.
- Exact next action: verify PR #96 CI, preview and mobile/desktop browser behavior; fix any failure in the same PR; then design/test zero-access client-side cryptography before enabling registration.
- References: PR #88; branch `maya-supabase-session-vaults`; PR #96; branch `maya-pocket-desk-context-v1`; head `124d9847d48b3b724408de6a5a479b13a2d4de47`.

### Historical Build Backfill — PR #9 forward (recorded 2026-09-02)

Scope and evidence:
- VERIFIED source: GitHub pull-request metadata retrieved from the canonical repository on 2026-09-02 UTC.
- A PR title records the stated change or intent only; it is not proof that the capability worked at runtime.
- `MERGED` verifies GitHub merge state. `CLOSED UNMERGED` verifies the work was not merged through that PR. `OPEN` verifies unresolved branch/PR state.
- Head SHAs identify the inspected PR revisions. They do not prove production deployment or runtime behavior.
- Checks, comments, failure logs, deployments and runtime tests were not uniformly recoverable for every historical PR in this pass. Those details remain UNKNOWN unless separately recorded below or in a later correction entry.
- Missing PR numbers from #9–#95: #10, #13, #26, #33, #34, #35, #36, #37, #38, #39, #40, #41, #69, #89, #91, #92, #93, #94. GitHub returned no pull-request record for those numbers; they may be issues, deleted/unavailable records, or unused numbers, and are not reconstructed.
- This is the best authoritative backfill available from the PR ledger. Later evidence must be appended as a correction/enrichment and must not silently rewrite this ledger.

| PR | Created (UTC) | Verified disposition | Stated intent/title (not runtime proof) | Inspected head |
|---|---|---|---|---|
| [#9](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/9) | 2026-07-23 | MERGED | Working on Maya functionality | `34f36164c9` |
| [#11](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/11) | 2026-08-06 | MERGED | Add GitHub Actions workflows for Vercel production and preview deployments | `333cce1007` |
| [#12](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/12) | 2026-08-07 | CLOSED UNMERGED DRAFT | Skip Vercel deploy steps when VERCEL_TOKEN secret is not configured | `53982e77e8` |
| [#14](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/14) | 2026-08-07 | MERGED | Implementing Anthropocene API for texting | `caac0d2531` |
| [#15](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/15) | 2026-08-08 | CLOSED UNMERGED DRAFT | Fix selectedPostId desync on filter change and add provider validation | `5083852717` |
| [#16](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/16) | 2026-08-09 | CLOSED UNMERGED | Secure private beta access | `14ded297e4` |
| [#17](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/17) | 2026-08-10 | CLOSED UNMERGED DRAFT | Security: stop leaking BETA_INVITE_CODES secrets from beta-validate endpoint | `f147fd3ffa` |
| [#18](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/18) | 2026-08-11 | MERGED | Copilot/connect chat gpt to maya | `326c847ec1` |
| [#19](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/19) | 2026-08-11 | CLOSED UNMERGED DRAFT | feat: add layered CEO intelligence and role memory | `643a5a5f54` |
| [#20](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/20) | 2026-08-12 | CLOSED UNMERGED DRAFT | Fix CEO mobile chat layout and Vercel HTML leakage | `06aed383bc` |
| [#21](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/21) | 2026-08-13 | CLOSED UNMERGED DRAFT | feat: add Gemini as hidden executive intelligence layer | `f8e01c55b9` |
| [#22](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/22) | 2026-08-13 | CLOSED UNMERGED DRAFT | fix: restore executive-first CEO chat interface | `e9f84c6f3d` |
| [#23](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/23) | 2026-08-15 | MERGED | feat: consolidate and harden MAYA private beta foundation | `8bbb8d550b` |
| [#24](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/24) | 2026-08-16 | MERGED | Removing invite-code gate component from the app | `6116a8b9ed` |
| [#25](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/25) | 2026-08-16 | CLOSED UNMERGED DRAFT | Guard Vercel preview deployment when PR secrets are unavailable | `a39d49d1e2` |
| [#27](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/27) | 2026-08-17 | MERGED | Integration: land PRs #23, #24, #16–#17, #19–#22 onto main | `6b2166113a` |
| [#28](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/28) | 2026-08-19 | CLOSED UNMERGED DRAFT | feat: GitHub OAuth integration — connect, read, and write repos from Maya | `c696419430` |
| [#29](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/29) | 2026-08-19 | CLOSED UNMERGED DRAFT | [WIP] Fix missing UI buttons after PR #27 merge | `2ff5bc11c4` |
| [#30](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/30) | 2026-08-21 | MERGED | fix: remove stale beta proxy redirect | `a89717df30` |
| [#31](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/31) | 2026-08-21 | MERGED | feat: simplify CEO page to centered chat | `4fc2a60b1f` |
| [#32](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/32) | 2026-08-21 | MERGED | CTO foundation: secure backend + resilient CEO frontend | `40083e0826` |
| [#42](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/42) | 2026-08-21 | CLOSED UNMERGED | CI: require automated tests before build | `0a8e492744` |
| [#43](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/43) | 2026-08-21 | MERGED | Add founder continuity activation gate | `4acc1904b4` |
| [#44](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/44) | 2026-08-22 | MERGED | Make Strategy Room run real executive adjudication | `282f812f61` |
| [#45](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/45) | 2026-08-22 | CLOSED UNMERGED DRAFT | feat: executive role fidelity + ThinkTank foundation | `ed51018501` |
| [#46](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/46) | 2026-08-23 | MERGED | Security hardening: disable in-app GitHub authority | `25c167e579` |
| [#47](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/47) | 2026-08-23 | MERGED | feat: executive role fidelity on secured baseline | `f92dba88ef` |
| [#48](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/48) | 2026-08-23 | CLOSED UNMERGED | Add automated production test gate | `6c515f6969` |
| [#49](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/49) | 2026-08-24 | MERGED | Add Maya Architecture Blueprint v1 | `729d9b12ca` |
| [#50](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/50) | 2026-08-24 | MERGED | Add standalone CEO executive chassis | `5706884501` |
| [#51](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/51) | 2026-08-24 | MERGED | Add CEO adversarial pushback evaluations | `277bb97034` |
| [#52](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/52) | 2026-08-24 | MERGED | Add standalone CTO executive chassis | `3be8c40296` |
| [#53](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/53) | 2026-08-24 | CLOSED UNMERGED | Add standalone CTO executive chassis | `d2b1fbb879` |
| [#54](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/54) | 2026-08-24 | MERGED | Add CEO↔CTO Maya adjudication contract | `4ca36d8bb2` |
| [#55](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/55) | 2026-08-24 | MERGED | Add executable CEO↔CTO conflict fixtures | `5db7447ec6` |
| [#56](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/56) | 2026-08-24 | CLOSED UNMERGED | Add branch and repository sprawl detector | `6545f6588b` |
| [#57](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/57) | 2026-08-24 | MERGED | security: establish MAYA repository guardrails | `655f84d800` |
| [#58](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/58) | 2026-08-24 | MERGED | security: enforce branch lifecycle in production | `60a7a6ec7c` |
| [#59](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/59) | 2026-08-24 | MERGED | security: purge legacy Copilot branch sprawl | `156407494f` |
| [#60](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/60) | 2026-08-24 | CLOSED UNMERGED | Build Dana CFO and Ari CTO executive chassis | `32f4a6cedc` |
| [#61](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/61) | 2026-08-25 | CLOSED UNMERGED DRAFT | DIH Event Mode: governed incident workspace | `49716a8bef` |
| [#62](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/62) | 2026-08-25 | MERGED | Build Maya executive core and specialist staff | `1339cc5d1a` |
| [#63](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/63) | 2026-08-25 | MERGED | Deepen Maya executive operating profiles | `2a195a0c43` |
| [#64](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/64) | 2026-08-25 | CLOSED UNMERGED | Integrate governed MAYA executives, DIH, and beta access | `dc14fb8ebd` |
| [#65](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/65) | 2026-08-26 | CLOSED UNMERGED | Wire Sam and Admin Secretary operating layer | `498bcf42e5` |
| [#66](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/66) | 2026-08-27 | MERGED | Govern Admin Secretary operating contract | `245cefef32` |
| [#67](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/67) | 2026-08-27 | OPEN | Wire persistent memory, saved sessions, and menu-surface context | `9e35162330` |
| [#68](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/68) | 2026-08-27 | MERGED | MAYA persistent memory foundation — Supabase integration | `25bdeb48f4` |
| [#70](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/70) | 2026-08-28 | OPEN | MAYA workspace persistence boundary and session reads | `9fb800c5ad` |
| [#71](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/71) | 2026-08-28 | OPEN | Build White Boardroom connector foundation | `377d4c9ef4` |
| [#72](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/72) | 2026-08-28 | MERGED | Add Adobe Creative Studio production hub | `ea3db8d7c3` |
| [#73](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/73) | 2026-08-28 | MERGED | Fix mobile executive workspace and add session files | `a1d61c60bb` |
| [#74](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/74) | 2026-08-28 | MERGED | Fix Sessions mobile overflow | `53dfd79974` |
| [#75](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/75) | 2026-08-28 | MERGED | Bind Notion connections to Client Vaults | `bb991ef4f0` |
| [#76](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/76) | 2026-08-29 | OPEN DRAFT | Complete standalone executive backbone and build gates | `8ac48982a2` |
| [#77](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/77) | 2026-08-30 | MERGED | Build MAYA White Boardroom | `c31cd0233c` |
| [#78](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/78) | 2026-08-30 | MERGED | Finish Erica as MAYA's standalone CMO executive | `64976dfc5f` |
| [#79](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/79) | 2026-08-30 | MERGED | Finish Dana as MAYA's standalone CFO executive | `739b0a6c3b` |
| [#80](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/80) | 2026-08-30 | MERGED | Build Ari as MAYA's standalone CTO operating clone | `0d2703f4ea` |
| [#81](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/81) | 2026-08-31 | CLOSED UNMERGED | Add Ari's gated CTO delivery command center | `e4a44be718` |
| [#82](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/82) | 2026-08-31 | MERGED | Restore executive boundaries and enforce full verification | `0609268a82` |
| [#83](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/83) | 2026-08-31 | MERGED | Add Ari's gated CTO delivery command center | `37f7d4e524` |
| [#84](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/84) | 2026-08-31 | MERGED | Restore protected chat API boundary | `4992d0112c` |
| [#85](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/85) | 2026-08-31 | MERGED | Wire Codex coding workspace into DIH continuity | `5d33f2dd03` |
| [#86](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/86) | 2026-08-31 | MERGED | Build authenticated persistent workspace foundation | `5bdac22404` |
| [#87](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/87) | 2026-08-31 | MERGED | Restore no-friction MAYA chat access | `4336939dd2` |
| [#88](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/88) | 2026-08-31 | OPEN | Design zero-access encrypted Pocket Office vaults | `fde4227dfb` |
| [#90](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/90) | 2026-08-31 | MERGED | Add Adobe Fonts library to White Boardroom | `2756aac1b7` |
| [#95](https://github.com/cre8veheart-ai/Maya_with_sidebar/pull/95) | 2026-08-31 | MERGED | Make MAYA own automatic session closeouts | `3530a4a60d` |

#### Historical phase reading (evidence-bounded)

- PRs #9–#31: early functionality, provider/chat integration, beta-access changes, CI/Vercel workflow work and CEO interface iteration. Several proposed fixes/features were closed unmerged; PR #27 explicitly stated an integration purpose, but that title alone does not prove every referenced capability survived intact.
- PRs #32–#49: secure-backend, continuity, Strategy Room, executive-role, repository-security and blueprint foundations. PR #46's stated removal of in-app GitHub authority superseded PR #28's unmerged OAuth proposal at the PR-intent level; runtime enforcement remains UNVERIFIED by this ledger alone.
- PRs #50–#66: standalone executive chassis work, adjudication fixtures, branch/security guardrails, executive core/profile work, DIH work and Admin Secretary governance. PR #53 duplicated the CTO title and closed unmerged; PR #52 is the verified merged CTO PR in that pair.
- PRs #67–#76: persistent memory/session boundaries, Supabase, White Boardroom, Adobe, mobile/session fixes and Client Vault/Notion work. PRs #67, #70, #71 and #76 remain open; therefore none may be assumed canonical over current `main`.
- PRs #77–#95: White Boardroom, standalone CMO/CFO/CTO work, protected chat, Codex/DIH continuity, authenticated persistence, no-friction access, client vaults, Adobe Fonts and automatic session closeouts. PR #88 remains open and its earlier server-readable vault path is explicitly blocked by the zero-access amendment.
- Verified reversal/fix signals from disposition and titles: #24 removed the invite-code gate after earlier beta-access work; #30 removed a stale beta proxy redirect; #46 disabled in-app GitHub authority after the unmerged #28 proposal; #82 stated restoration of executive boundaries; #84 stated restoration of the protected chat boundary; #87 restored no-friction access after #86 introduced authenticated persistence. These are verified historical change claims and merge states, not complete runtime proofs.
- Known unresolved legacy branches at backfill time: #67, #70, #71, #76 and #88. They require reconciliation or closure; their descriptions cannot override this blueprint.
- Known verified disposition already investigated in depth: PR #64 was stale/dirty and closed without merge on 2026-09-02. PR #88's server-readable design was contradicted by the founder-approved zero-access requirement and marked do-not-merge.

#### Backfill failures, limitations and next enrichment gate

- Failed attempt: the first all-PR API retrieval produced output too large for a reliable working capture.
- Fix: repeated the same authoritative GitHub collection request and reduced it to compact metadata fields before writing the ledger.
- Verification after fix: 65 PR records from #9 through #95 were parsed; each ledger row includes number, creation date, disposition, title and head SHA.
- Remaining UNKNOWN: exact code delta, CI result, preview/production deployment, runtime result, regression, failure log and corrective commit for many individual PRs.
- Next enrichment gate: when a historical PR becomes relevant to active work, fetch its diff, comments, checks and linked deployment, then append a dated correction/enrichment entry using VERIFIED / CONTRADICTED / UNVERIFIED / UNKNOWN.
- No historical title, body, green check or READY deployment may be promoted to runtime proof without the corresponding capability test.

### Amendment History

- 2026-09-22: Split this document. Product/roadmap content moved to `docs/MAYA_POCKET_OFFICE_ROADMAP.md` (non-binding). Demoted this document's status from "living build authority" to "engineering reference and audit history — descriptive, not independently binding policy." The only binding authorities over engineering work are Leslie's explicit direction and `AGENTS.md`. Corrected header to name Leslie explicitly as sole Owner and Ari as a subordinate maintainer rather than a parallel role.

- 2026-09-10: Removed the custom Claude MCP control plane and provider-specific merge syntax; retained provider-neutral Founder approval, ordinary PR workflows, full verification, credential protection, and recovery through Git history.

- 2026-09-08: Applied one Founder-authorized production rule to all engineering agents. Claude and Ari may build branches and pull requests; a merge to `main` requires Leslie's fresh approval for the exact latest commit, and later commits invalidate prior approval.
- 2026-09-08: Founder Leslie personally discovered and ordered removal of repository hardening and automatic branch-deletion controls. Established Founder authority over repository-local policies; conflicts now require disclosure and Founder decision rather than an automatic stop.
- 2026-09-02: Made the blueprint the living build authority on `main`.
- 2026-09-02: Established General user memory plus isolated foreground-client context.
- 2026-09-02: Established multiple active Pocket Desk clients with zero background context contribution.
- 2026-09-02: Rejected server-readable client-vault plaintext; required client-side encryption and ciphertext-only storage.
- 2026-09-02: Established client menu activation, closeout, off-site transfer, portability and erasure rules.
- 2026-09-02: Initially required Founder approval before tooling changes; superseded later the same day.
- 2026-09-02: Authorized autonomous reversible tooling changes within existing authority, with mandatory blueprint traceability and Founder approval retained for credentials, costs, client-data exposure, destructive action and material product-direction changes.
- 2026-09-02: Created the initial preapproved-tool register and mandatory per-tool trace template.


## 1. Platform Rule

Maya Core is the stable frame. Major capabilities are built as separable plug-in modules or shared services inside the same private repository unless and until there is a clear reason to extract them.

Every feature must answer four questions before build:
1. Where does it live?
2. What does it own?
3. What does it connect to?
4. What permissions does it have?

If an architectural choice has meaningful tradeoffs, stop and discuss options before hard-wiring the decision.

## 2. Maya Core — Locked Frame

Core responsibilities:
- Authentication and session handling
- Secrets handling
- Permission policy and least privilege
- Maya orchestration and adjudication
- Deployment gates and CI verification
- Alerts and auditability
- Shared application shell and navigation

Rule: Core changes require deliberate review. Feature code should not casually leak into Core.


## 14. Claude Engineering Access

Founder decision — 2026-09-05 (supersedes the restrictive 2026-09-04 Claude policy):

- Claude uses Anthropic's standard Claude Code GitHub Action behavior and normal working tools.
- Claude has repository contents, issues and pull-request read/write authority through the installed GitHub integration and may inspect code, edit files, run commands and tests, create commits and branches, open or update pull requests, and inspect CI.
- No repository instruction may silently reduce Claude to review-only mode or substitute a custom restricted tool profile for Anthropic defaults.
- The official Vercel MCP connection is available to Claude project sessions. Each Claude environment must complete Vercel OAuth when first prompted; credentials are never committed to the repository.
- Claude-created branches and pull requests may trigger preview builds through the canonical GitHub-to-Vercel integration.
- Granted technical permission and authorization to use it are separate. Claude and Ari may inspect, edit, test, branch, and open or update pull requests without separate merge permission.
- Production authority remains with Founder Leslie. Claude, Ari/Codex, Copilot, and later collaborators may merge an eligible pull request only after Leslie explicitly approves the current pull request.
- Approval may be given in the current working conversation or through GitHub's ordinary approval controls. No provider-specific phrase, exact-comment syntax, custom MCP gate, or special bot workflow is required.
- If a materially different commit is added after approval, disclose the change and obtain renewed approval before production.
- Pull-request preview deployments remain automatic and reversible. Production may come only from `main` after the Founder-authorized merge; green checks or a READY preview are not themselves merge permission.
- Standard engineering safeguards remain: do not expose secrets, do not copy client-vault plaintext into engineering context, report failures accurately, and preserve one canonical repository and deployment path.

### Work History Trail — 2026-09-10 custom Claude control-plane removal

- Founder authorization: remove Claude-specific control-plane remnants from the repository and live GitHub/Vercel configuration while preserving ordinary collaborator access, required MAYA verification, secrets protection, client-vault boundaries, and Founder production authority.
- PR/branch: PR #123, `ari/restore-ai-team-collaboration`.
- Repository removals: `.github/workflows/claude.yml`; `services/claude-mcp/**`; `scripts/audit-read-write-infiltrates.mjs`; the `verify-claude-mcp` job; provider-specific branch allowlists, exact-comment merge gates, and MCP verification requirements.
- Replacements: `scripts/audit-credential-leaks.mjs`; `test:credentials`; credential-leak steps in preview, production, and full verification workflows; provider-neutral Founder approval language.
- External sweep: GitHub repository rulesets returned `[]`. Branch-protection details remain UNKNOWN because the installed integration returned 403 without administration read access. Vercel confirmed the separate project `maya-claude-mcp` (`prj_uQg0guOVAMsAbIkmOPMZorN85Pzc`) still exists and is linked to this repository; deletion remains pending.
- Verification: initial PR head passed MAYA Full Verification and both Vercel status contexts. A second sweep found and corrected two leftover workflow calls plus stale policy text; final checks are pending on the newest commit.
- Recovery: revert PR #123 or restore individual deleted files from pre-PR `main` commit `13224fd45c30df1cb4e3303f695126c92593d3f7`. Recreate the Vercel project only if a future approved architecture again requires a dedicated MCP service.

### Work History Trail — 2026-09-08 Founder-authorized agent merges

- Founder authorization: Claude and Ari may perform normal engineering work and create pull requests; either may merge to the Vercel production path only with Leslie's permission for the exact final PR state.
- Change: PR #111 adds a fresh post-commit `@claude merge` gate, limits the `@claude` workflow caller to `cre8veheart-ai`, removes unused OIDC permission, pins the Anthropic action, and records the equivalent `@ari merge` operating rule in `AGENTS.md`.
- Data and permission boundary: no credential is added; work remains confined to approved feature/fix branches, and client-vault plaintext remains prohibited.
- Verification: VERIFIED on code commit `bc45e5a4cb37c81bc36be7b0968891187a58a063` — GitHub Actions run `34276400392` passed full verification and the Claude MCP security job; both Vercel previews reported successful deployment.
- Remaining live proof: Claude's first branch/PR creation and the first Founder-approved production merge remain UNVERIFIED until exercised.
- Exact next action: verify the final documentation-only commit, mark PR #111 ready, then obtain Leslie's fresh merge authorization.

### Work History Trail — 2026-09-05 Claude access restoration

- Founder authorization: remove the Claude-specific restrictions and restore Anthropic-default working capabilities across MAYA sessions and builds.
- Changes: replaced the review-only Claude workflow with Anthropic's standard write-enabled workflow; removed the restrictive `CLAUDE.md`; restored GitHub OAuth repository/workflow scopes and the runtime write endpoint; added the official Vercel MCP project connection.
- Verification target: full repository verification, Claude `@claude` branch/PR test, and a Vercel preview build from that branch.
- Remaining external step: a Claude environment may require a one-time Vercel OAuth approval before direct Vercel MCP tools appear. This is an external account authorization, not a repository restriction.

### Work History Trail — 2026-09-04 governed Claude access

- Evidence: current `main` at `8493459c5e09287859b06703a08769502989f529` has an unprotected branch, an existing full-verification workflow, Vercel preview/production workflows, and a branch-lifecycle rule rejecting `copilot/*` branches.
- Change: created `feature/governed-claude-access`; added `.github/workflows/claude.yml` and `CLAUDE.md`.
- Result: VERIFIED that both files coexist on branch commit `bc7c5247a6dac12625b683ecab11fa2c5e002834`. Runtime Claude invocation remains UNVERIFIED until the workflow is merged to the default branch and a Founder-authored `@claude` test is executed.
- Security boundary: workflow trigger is restricted to GitHub actor `cre8veheart-ai`; production deploy, merge, secrets changes, and repository administration are prohibited in Claude instructions.
- Unresolved blocker: `main` remains unprotected. Branch protection must be enabled before this path is considered production-ready.
- Exact next action: open the governed Claude PR, require full verification, then enable `main` protection before merge and run a Founder-authored `@claude` test.



### Work History Trail — 2026-09-10 third-party connection and root-config sweep

- Founder direction: preserve legitimate third-party services as optional MAYA tools; remove only obsolete control planes, duplicate deployment paths, permission interference and misleading configuration.
- Connection inventory: Anthropic, OpenAI, Gemini and OpenClaw remain optional provider capabilities; GitHub, canonical Vercel and Google Drive remain connected tools. Zapier, Adobe and Notion are approved future options but were not verified as installed ChatGPT connections during this sweep.
- Root cleanup: removed stale `services/claude-mcp/**` exclusions from `eslint.config.mjs` and `tsconfig.json` after the service deletion.
- Deployment cleanup: removed `.github/workflows/vercel-preview.yml` and `.github/workflows/vercel-deploy.yml`. Both used the third-party `amondnet/vercel-action@v25`; the preview deployment step was silently skipped when secrets were missing, while the native Vercel Git integration separately deployed the same commit. The canonical native Git integration remains.
- Documentation correction: replaced the stale README claim that MAYA currently fails closed behind an invite-code gate; documented actual provider, persistence, access and beta limitations without representing staged connectors as active.
- External removal still pending: Vercel project `maya-claude-mcp` remains linked to the repository and must be deleted through a Vercel management surface that supports project deletion.
- Recovery: restore either removed workflow or root-config entry from pre-PR main commit `13224fd45c30df1cb4e3303f695126c92593d3f7`; revert this PR commit to restore the previous README as a unit.
- Verification gate: full GitHub verification plus one canonical Vercel preview on the resulting commit. PR remains unmerged pending Leslie's approval of its exact final head.


### Work History Trail — 2026-09-10 obsolete control-plane PR closure

- Founder direction: continue disassembling technical blocks while preserving legitimate third-party tools as optional capabilities.
- Closed without merge: PR #97 (custom Claude Anthropic MCP access), PR #117 and PR #121 (Claude-specific trigger workflow revisions), PR #120 (model pin used only by the removed Claude workflow), and PR #122 (second in-app main-push control plane and OAuth allowlists).
- Reason: each PR would restore, modify or depend on the superseded control-plane architecture removed by PR #123.
- Preservation: each PR received an explanatory closure comment; branches, commits, diffs and conversation history remain recoverable. No branch or commit history was deleted.
- Unaffected: MAYA's Anthropic runtime provider, official optional tools/connectors, canonical GitHub integration, canonical native Vercel integration and unrelated feature PRs.
- Verification before closure: every target was confirmed open and its current title/body inspected. GitHub returned each target as closed and unmerged afterward.


### Work History Trail — 2026-09-10 layered authorization-remnant sweep

- Historical layers traced: repository policy documents, agent instructions, verification scripts, runtime OAuth/session code, GitHub workflows and external project connections.
- Confirmed already removed: `.github/MAYA_SECURITY_GUARDRAILS.md` and `.github/workflows/branch-lifecycle.yml`, including automatic deletion of `copilot/*`, merged and closed-PR branches.
- Removed in this sweep: `docs/MAYA_JAIL.md`. It was non-executable but instructed future operators to treat capabilities as detained/convicted, fail unknown authority closed and revoke externally connected authority not justified by the jail ledger.
- Restored: GitHub product session cookie duration from the hardening-imposed 8 hours to the prior 30 days in `lib/github/session.ts`. Session invalidation on true authentication failure remains.
- Preserved intentionally: founder continuity code and verification because it carries Leslie's requested DIH continuity and does not grant repository authority.
- Migration blocker exposed, not removed: legacy beta-session authentication remains used by profile, role-lens, saved-session and Strategy Room APIs. Chat itself no longer uses that gate. Removing these checks before one unified MAYA sign-in replaces them would either break persistence or expose user data.
- Recovery: restore `docs/MAYA_JAIL.md` from pre-PR main commit `13224fd45c30df1cb4e3303f695126c92593d3f7`; change `getCookieOptions(60 * 60 * 24 * 30)` back to `getCookieOptions(60 * 60 * 8)` to restore the shortened connector session.
- Verification gate: full repository verification on the final PR head; one unified sign-in migration must be a separately tested implementation slice.


### Work History Trail — 2026-09-10 full PR #1–#123 layered-authority audit

- Scope: inspected every numbered repository item from #1 through #123 and traced policy, workflow, runtime, test, session, OAuth, connector, deployment and issue-level authority.
- Earliest exposure event: PR #1 proposed temporarily changing the repository from private to public. Issue #34 later recorded that the repository was in fact public and directed restoration to private.
- Deployment layer: PRs #7 and #11 introduced third-party Vercel Action workflows; PRs #12 and #25 converted missing deployment credentials into skipped steps that could leave the workflow green. These workflows are removed in PR #123; native canonical Vercel Git deployment remains.
- Beta-auth layer: PR #16 installed the signed invite/Redis gate; PR #24 removed its visible components; PR #30 removed a stale redirect; PRs #32, #48, #84 and #86 retained/reintroduced authentication beneath selected APIs; PR #87 removed it from chat; PR #109 removed retired beta dependencies from health. Current residual use is limited to profile, role-lens, saved-session and Strategy Room APIs pending unified sign-in.
- Repository-authority layer: PR #46 disabled GitHub OAuth/write access; PR #57 established restrictive policy; PRs #58 and #59 automatically deleted branches; PR #106 removed the explicit policy and branch-deletion workflow. PR #123 removes remaining MCP/workflow/audit/policy remnants.
- Claude-specific layer: PRs #97–#123 repeatedly added, restricted, restored, pinned and tested a repository-specific Claude execution path. Obsolete PRs #97, #117, #120, #121 and #122 were closed earlier in this cleanup; issues #107, #116 and #119 are now closed as superseded.
- Stale directive cleanup: closed issues #33, #36, #37, #40 and #69 because they instructed future work to restore retired beta blockers or asserted a parallel canonical build authority. Closed PR #105 as unrelated incident-period navigation scaffolding. Every item retains comments, diffs and recoverable history.
- Preserved open work: #34 remains until duplicate Vercel projects are fully removed; #35 persistence, #38 observability, #39 release quality, #41 tooling capability, #67/#70 persistence investigation, #71 connectors, #76 executive backbone, #89/#91–#94 product design, #96 Pocket Desk and security dependency updates remain subject to current blueprint review.
- Verified founder-auth impact: restrictions affected real OAuth scopes, runtime write/workflow capability, sessions, repository allowlists, workflow permissions, token wiring, automatic branch deletion, deployment execution and the instructions/tests future agents were required to follow.
- Recovery: all closed issues/PRs may be reopened; deleted files and prior session duration remain recoverable from pre-PR main commit `13224fd45c30df1cb4e3303f695126c92593d3f7`.

### Work History Trail — 2026-09-19 approval workflow false-failure fix

- Trigger or task: fix failing GitHub Actions job `approval` from check run `105860886178` / run `35429303629`.
- Blueprint sections used: Blueprint governance; Current Working Checkpoint; Required validation; Engineering discipline.
- Live evidence checked: GitHub Actions `list_workflow_runs` showed repeated `Founder Exact-Head Approval` failures on `issue_comment`; job logs for `105860886178` showed `vercel[bot]` triggered the workflow and the job exited with `Comment exactly 'APPROVE 4e5d120f5c07c9b27f11f02df4d2d660b54f111c' as @cre8veheart-ai.` after posting a pending status on PR #127.
- Root cause classification: VERIFIED — the workflow treated every PR `issue_comment` as an approval attempt instead of only founder approval comments, so unrelated bot comments produced false failures.
- Changes made: added `lib/founder-approval-core.mjs`; added `scripts/founder-exact-head-approval.mjs`; added `tests/founder-approval-core.test.mjs`; replaced the inline shell in `.github/workflows/founder-exact-head-approval.yml` with the scripted check plus repository checkout so the workflow can skip unrelated comments while preserving exact-head approval enforcement.
- Attempted fixes and failures: first extraction attempt forgot that Actions runners do not automatically include repository files, which would have left `node scripts/founder-exact-head-approval.mjs` unavailable; corrected by adding `actions/checkout@v4` before final verification.
- Verification performed after fixes: `node --test tests/founder-approval-core.test.mjs` PASSED; `npm ci` PASSED; `npm run verify` PASSED, including lint, credential audit, repository tests, focused MAYA verification scripts, and production build.
- Verified result: local repository validation is green and the approval logic now distinguishes unrelated bot chatter from founder approval events.
- Remaining blocker or unknown: post-merge execution of the updated workflow from `main` is still UNVERIFIED because `issue_comment` workflows execute from the default branch, so this branch cannot prove the live comment-trigger behavior until merged.
- Exact first next action: merge only after review/approval, then confirm on the next qualifying PR comment that unrelated bot comments no longer fail the approval gate.
- Relevant PR, branch and commit identifiers: PR #135; branch `copilot/fix-approval-job-failure`; verification head at local commit `82cac577f399a1f553194611febe75a6fb90e080` before the blueprint update commit.

### Work History Trail — 2026-09-21 stale gate language correction in AGENTS.md

- Trigger or task: Founder asked to "get rid of PR #123." PR #123 (merged 2026-09-11, `fe42234`) is closed and merged; GitHub does not allow deleting a merged PR, so a full `git revert -m 1` of its merge commit was evaluated instead.
- Evidence checked: `git revert -m 1 --no-commit fe42234` against current `main` produced conflicts in `.github/workflows/claude.yml`, `docs/MAYA_ARCHITECTURE_BLUEPRINT_V1.md`, and `package.json`, plus clean-applied changes across 19 more files.
- Root cause classification: VERIFIED — a full revert would reintroduce a `lib/github/config.ts` fail-open-to-empty-allowlist bug, reintroduce GitHub session deletion on non-401 connector errors (`lib/github/api.ts`, `app/api/github/status/route.ts`), downgrade `scripts/audit-credential-leaks.mjs` back to the older `audit-read-write-infiltrates.mjs`, resurrect the removed `services/claude-mcp` duplicate microservice and its duplicate `vercel-deploy.yml`/`vercel-preview.yml` GitHub Actions, and overwrite two blocks of append-only Work History Trail content with stale pre-#111 checkpoint text. Founder separately confirmed `docs/MAYA_JAIL.md` must not return.
- Decision: full revert REJECTED. Only one piece of PR #123 was still live and actually wrong: `AGENTS.md`'s "Founder-authorized production rule" retained #123's looser authorization language ("no exact-comment syntax required"), which is stale relative to the `founder-exact-head-approval` GitHub Actions gate (`APPROVE <head_sha>`) installed afterward by PR #133 and currently enforcing on every PR (confirmed live via PR #134's own merge, which required and received a matching `APPROVE 2e9568e...` comment).
- Changes made: rewrote `AGENTS.md`'s "Founder-authorized production rule" section to name the live `founder-exact-head-approval.yml` / `scripts/founder-exact-head-approval.mjs` mechanism and its exact `APPROVE <head_sha>` comment requirement explicitly, replacing the superseded "no exact-comment syntax required" text. No runtime code, workflow, or CI behavior changed.
- Verification performed: `npm ci` and `npm run verify` PASSED locally before push (lint, credential audit, unit/integration tests, blackbox/security-gauntlet evals, production build); `npm run verify` GitHub Actions check VERIFIED passing on PR #142.
- Verified result: documentation now matches enforced reality; no functional change.
- Remaining blocker or unknown: PR #142 is open and green on `npm run verify`; only the `founder-exact-head-approval` check is outstanding, pending Leslie's `APPROVE <sha>` comment. The broader PR #123 revert remains available if the Founder wants any of the rejected items (duplicate MCP service, old audit script, shorter GitHub session, etc.) restored individually — none should be restored as a single blanket revert.
- Relevant PR, branch and commit identifiers: PR #142; branch `fix/agents-md-exact-head-gate`, created from `main` at `1301812`; verification head `fa6a6aec27e440ec523c2a22078a58eede4a154b`.

### Work History Trail — 2026-09-22 blueprint split and authority correction

- Trigger or task: Founder flagged that this document (formerly "Maya Architecture Blueprint v1.0") had its product/roadmap content reframed as binding "MAYA build authority" without her having reviewed that specific framing decision, and separately flagged the header's "Owner: Founder" / "Technical lead: Ari / CTO" formatting as positioning Ari as a co-equal party rather than her subordinate.
- Evidence checked: `git log --follow --diff-filter=A` traced the document to its 2026-08-25 creation as "Working architectural source of truth." Commit `079a6ec` ("Make MAYA blueprint the living build authority", 2026-09-01) changed the Status line to "Living, active and amendable MAYA build authority" and added binding governance language, bundled in the same commit as legitimate Pocket Office/Client Vault architecture work. `AGENTS.md` separately made reading this document REQUIRED before any planning, architecture, implementation, review, testing, deployment, product interpretation, menu, memory, executive, client-vault or merge work — i.e. it functioned as policy gating every agent, including Claude, despite containing substantial non-governance product-roadmap content (planned executives, shared services, Whiteboard Room, Maya Live, Art Gallery, menu structure, build order, decision gates).
- Root cause classification: VERIFIED — a single document mixing product-roadmap planning with binding engineering policy, under a "build authority" status line, let roadmap content acquire unintended gating force over agent behavior; the authority escalation and the roadmap content were never separated for independent Founder review.
- Changes made: split this document. Product/feature roadmap content (former sections 3–13: Executive Suite, Shared Maya Services, Whiteboard Room, Maya Live, Art Gallery Module, Core Menu, Data and Object Rules, Permission Rules, Build Order, Decision Gates, Architectural North Star) moved to `docs/MAYA_POCKET_OFFICE_ROADMAP.md`, explicitly marked non-binding. This document keeps the Preapproved Tool Register, Current Working Checkpoint, Resume/Amendment protocol, Work History Trail, Amendment History, Platform Rule, Maya Core Locked Frame, and Claude Engineering Access history, with its Status demoted from "build authority" to "engineering reference and audit history — descriptive, not independently binding policy." Header rewritten to name Leslie explicitly as sole Owner and Ari as a subordinate maintainer, not a parallel role. A stale 2026-09-02 checkpoint snapshot ("What we were building" / "Where work stopped" / "First next action", referring to the long-resolved PR #96 work) was removed as superseded, per this document's own Amendment protocol.
- Verified result: pending `npm run verify` and PR review on the branch making this change.
- Remaining blocker or unknown: `AGENTS.md`'s "Living MAYA blueprint — REQUIRED" section must be updated in the same change to stop treating either resulting document as mandatory gating policy over all agent work, and to add explicit restrictions on Ari/Copilot's and ChatGPT's build/governance-document authority per Founder request in the same session.
- Exact first next action: update `AGENTS.md` accordingly, run `npm run verify`, push, and open a PR describing this as a governance correction, not a product decision.
- Relevant PR, branch and commit identifiers: to be recorded on push.
