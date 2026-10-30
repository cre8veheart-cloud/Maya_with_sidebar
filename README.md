# MAYA — Executive Operating System

MAYA is a governed executive workspace with role-specific AI executives, persistent context, structured decisions, shared workspaces, and optional external tools.

## Current engineering state

MAYA is under active private-beta development. The canonical source is this repository and the canonical hosted project is `maya-with-sidebar`.

Current capabilities include:

- Executive chat surfaces and role-specific operating contracts.
- Anthropic as the default AI provider, with optional OpenAI and OpenClaw provider adapters.
- An optional internal Gemini advisory layer.
- GitHub engineering integration scoped to the canonical MAYA repository.
- Persistent-profile and role-lens API foundations.
- Browser-local workflows that are still being migrated to durable storage.

Run the complete verification suite before treating a change as beta-ready:

```bash
npm ci
npm run verify
```

A successful build or deployment status is not by itself proof that every user-facing capability works. Browser and API behavior must also be verified.

## Local development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Configure only the providers and services required for the capability being tested. Never commit credentials.

## Service configuration

| Variable group | Purpose | Current status |
| --- | --- | --- |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Default MAYA intelligence provider | Active integration |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Optional OpenAI provider | Optional |
| `OPENCLAW_BASE_URL`, `OPENCLAW_API_KEY`, `OPENCLAW_MODEL` | Optional compatible external gateway | Optional; destination must be trusted |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `MAYA_GEMINI_ENABLED` | Internal executive advisory layer | Optional |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Durable server-owned workspace storage foundation | In development |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Legacy beta invite/redemption storage | Under review |
| GitHub OAuth variables | Repository engineering connection | Canonical repository only |
| Vercel project variables | Hosted deployment configuration | Canonical project only |

The complete placeholder list and server/client boundaries are documented in `.env.example`.

## Access and data boundaries

- Leslie remains the final production authority.
- External providers are tools, not MAYA authorities.
- Client Vault plaintext must not be exposed to model providers, engineering tools, logs, or deployment systems.
- Provider credentials and service-role keys remain server-only.
- Connections that publish, send, deploy, spend money, or access client data require explicit authorization and an activity record.
- Preview and production behavior must use the one canonical Vercel project; duplicate deployments are not part of the architecture.

## Current limitations

- One unified MAYA sign-in and the final client-vault authentication model are not yet complete.
- Some surveys, provider preferences, community content, documents, sessions, decisions, campaigns, and connector surfaces remain browser-local or UI-only.
- Supabase-backed durability and encrypted Client Vault portability require further implementation and end-to-end verification.
- Optional website, email, calendar, Zapier, Adobe, Notion, Google Drive, and other tool capabilities remain staged integrations rather than assumed access.

See `docs/MAYA_ARCHITECTURE_BLUEPRINT_V1.md` for the active architecture, governance, recovery ledger, verified checkpoint, and build order.
