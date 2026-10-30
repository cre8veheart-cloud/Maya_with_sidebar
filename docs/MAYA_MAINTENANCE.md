# Maya: fewer setup steps

## One read-only check

```sh
npm run doctor
```

This checks Node compatibility and whether `ANTHROPIC_API_KEY` is present in
the current shell. It does not read `.env` files, inspect Replit connectors,
print secrets, sign in, change permissions, deploy, or make paid AI calls.
An environment variable being present is **not proof its value works**.
Do not reset credentials or buy an upgrade just because configuration is missing.

To check an existing app, without requiring its runtime secrets locally:

```sh
npm run doctor -- --url https://your-app-host
```

Use only the origin, never a token, login URL, or query string. The only request
is an unauthenticated GET to `/api/health`, with a five-second timeout and no
redirects. The existing health route reports app/Anthropic configuration,
not successful model calls, account billing, login, or storage.
Local and remote configuration are reported separately.

Exit codes: `0` = selected configuration/health check passed (not production
approval); `1` = unsupported Node, missing local configuration, or unsuccessful
remote health; `2` = invalid command or app origin.

## Engineering without another sign-in

```sh
npm run verify
npm run verify:cloudflare
```

The first command runs the existing tests and production build. The second
packages the Cloudflare Worker as a dry run **without uploading it**.
Neither is an instruction to reconnect working accounts.
Repository CI runs these checks on the supported pull-request branches.

## Keep the three kinds of access separate

- Browser sign-in: lets Leslie use a service.
- Replit connection: lets the conversation access that service.
- App/workflow secrets: let a particular runtime or job perform its work.

A secret belongs only in the secure store of the runtime/job that needs it.
Do not automatically duplicate keys into GitHub and hosting providers.
Never put them in source, plain-text notes, screenshots, or PR comments.

## Recovery boundaries

The recovered source ZIP fingerprints original commit
`93d2820193738b39173e6d8948974ef8f4abb43c`, with September 23, 2026 entry
timestamps. Its October upload date does not establish October source freshness.
The original archived repository ID is `1297973311`; the separate accessible
recovery repository ID is `1424200826`. They are not the same repository renamed.
Neither passing checks nor the recovery preview proves latest Vercel source parity.

Keep Vercel and existing data intact until the original/latest source is identified,
the approved PR changes are integrated, and Cloudflare passes actual AI, login,
files, persistence and rollback checks. Existing exact-head Founder approval and
main-only production rules remain unchanged. The diagnostic command adds no gate.
