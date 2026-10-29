# Cloudflare Workers deployment

This is an alternative packaging target for the recovered Next.js application,
not a new implementation. Vercel configuration and server API routes remain in
place. No static export is used: chat, OAuth and session routes require a server.

## Recovery prerequisite

The accessible repository's `main` currently contains only a README and an empty
workflow. Recovery PR #1 restores the source from a Google Drive ZIP; this does
not establish that it is identical to the latest Vercel production source.
This deployment change is stacked on that recovery branch so the exact archive
recovery remains separate. Do not retry the old `12f73b4` Cloudflare build.

The archived engineering instructions identify the canonical Vercel project as
`maya-with-sidebar` under team `mayav11`; the Founder calls the surviving Vercel
application Maya11. Verify the current Vercel identity before any cutover.

## Local verification (no Cloudflare account required)

Use Node.js 22 or later, supported by the pinned Wrangler toolchain.

```sh
npm ci
npm run verify
npm run verify:cloudflare
npm run preview:cloudflare -- --port 8787
```

`verify:cloudflare` creates the Next.js/OpenNext output and runs a local Wrangler
deployment dry-run. It does not publish, create a resource, or change DNS.
`preview:cloudflare` serves that output locally in Cloudflare's Workers runtime.
The standard `npm run build` remains the Vercel-compatible Next.js build.

## Existing Cloudflare project build settings

Only after the recovery and deployment changes are reviewed and approved:

- Repository: `cre8veheart-cloud/Maya_with_sidebar`, unless the Founder chooses
  a different canonical destination after verifying ownership.
- Production branch: `main`; never use the recovery/fix branch for production.
- Root directory: `/`.
- Build command: `npm run build:cloudflare`.
- Deploy command: `npm run deploy:cloudflare`.
- Build environment: Node.js 22 or later.
- Worker name: confirm the existing project is `maya-with-sidebar`. If different,
  update both `name` and `services[0].service` in `wrangler.jsonc` together before
  deployment. Do not accidentally create a second Worker.

The GitHub Actions workflow in `.github/workflows/main.yml` runs locked install,
the full application verification suite, Cloudflare packaging/dry-run, and a
dependency audit. It triggers on pull requests to main or the recovery branch,
pushes to main, and manual dispatch once GitHub makes the workflow available.
It has read-only repository permissions, pinned action commits, and no deployment
credentials. Repository Actions permissions must allow the workflow to run.

No automatic deployment workflow, production publish trigger, new R2 bucket, database,
paid plan, or domain is introduced by this PR. Check the account's Workers limits
against the dry-run bundle size before approving deployment.

`wrangler.jsonc` intentionally does not embed account IDs, secrets or custom
domain routes. Keep the existing Vercel app and DNS untouched until Cloudflare
capability tests pass and the Founder explicitly approves cutover.

## Credentials and capability boundaries

Replit's Cloudflare connector credential is separate from the Cloudflare build
token and MAYA's runtime secrets. Repairing one does not populate the others.
Set required runtime credentials as encrypted Worker secrets in Cloudflare;
do not put them in Git, build logs, screenshots, public variables or chat.
Use `.env.example` for variable names and boundaries, not production values.

Health returns HTTP 503 with `anthropicConfigured: false` until
`ANTHROPIC_API_KEY` is configured. That is expected degraded behavior, not proof
of a deployment failure. A successful homepage does not verify live AI, storage,
OAuth, cross-device persistence, or client-vault security.

OAuth redirect URLs and application origin settings need a separately approved
review if the public hostname changes. Existing Vercel KV/Supabase services are
not migrated, replaced or bypassed here.

## Production approval and rollback

Follow `AGENTS.md` for exact-head Founder approval. The archived instructions
refer to approval workflows not present in the accessible recovery copy; do not
claim that branch protections or those checks are currently enforced.
No agent may merge or deploy this change based on a passing local build alone.

Rollback before deployment: close the unmerged fix PR. After an explicitly
approved deployment, use the existing Cloudflare version rollback process;
leave Vercel and DNS available until the replacement is verified. This document
does not authorize rollback or production changes.
