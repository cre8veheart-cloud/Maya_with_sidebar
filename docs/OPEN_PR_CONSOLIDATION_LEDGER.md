# Open PR Consolidation Ledger

This ledger records the one-time review of every open pull request against
`main` at `4f2227390586a0dce8872d5ddb03d74c20354235`.

| PR | Classification | Disposition in the stabilization branch |
| --- | --- | --- |
| #1 | Obsolete prototype | Superseded by the production application already in `main`; no files carried. |
| #2 | Superseded security baseline | Current `main` already uses the later Next.js 14.2.35 security patch and lockfile; no files carried. |
| #6 | Empty/no effective diff | No files to carry. |
| #7 | Superseded production-app history | Its application, route, storage, and deployment foundation reached `main` through later merged PRs; no old branch snapshot carried. |
| #12 | Required workflow guard | Both Vercel workflows carried so missing `VERCEL_TOKEN` skips deploy steps safely. |
| #15 | Required bug fixes | Community selection synchronization, provider validation, and RoleChat loading/error behavior carried. |
| #16 | Required private-beta foundation | Signed HTTP-only sessions, atomic invite redemption, chat protection/rate limiting, protected-route proxy gate, configuration, and operations documentation carried. |
| #17 | Security fix superseded; unrelated scaffold excluded | Invite-code non-disclosure is already enforced by #16. The incomplete GitHub/OpenAI scaffold was not carried because PR #18 intentionally removed OpenAI as a Maya provider and the scaffold is not an accepted beta capability. |
| #19 | Required executive foundation | Eight-layer CEO contract, role-isolated bounded thread memory, governance checks, and executive prompt integration carried. |
| #20 | Required mobile/error behavior | CEO-first stacked layout, mobile spacing/composer behavior, and HTML-error suppression are present through the consolidated #19 state, with desktop padding corrected. |
| #21 | Required hidden advisory behavior | Server-controlled, kill-switchable Gemini advisory with timeout, no storage, silent fallback, and untrusted-input boundary carried through #19. |
| #22 | Required executive-first interface | Provider controls remain hidden from executive chat; the larger top composer and single executive identity are carried through #19. |

## Merge discipline

This stabilization branch is the only integration candidate. `main` remains the
sole persistent branch. Old PRs must not be closed until this branch passes its
local verification suite and Vercel preview checks and is approved for merge.
