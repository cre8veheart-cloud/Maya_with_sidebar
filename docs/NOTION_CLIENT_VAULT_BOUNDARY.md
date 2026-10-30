# Notion connection boundary for Client Vaults

Notion is a per-Client-Vault connector. It is never a global MAYA Library token.

## Required identity chain

`authenticated user -> MAYA workspace -> selected Client Vault -> Notion binding -> shared Notion resources`

A browser-supplied workspace, client, page, database, or data-source ID is only a selector. It is not authorization.

## Binding record

The persistent `notion_vault_connections` record must contain:

- MAYA `workspace_id`
- MAYA `client_id`
- Notion `workspace_id`
- optional root page and allowed data-source IDs
- an encrypted server-side credential reference (never the access token)
- connection status and connection audit fields

The access token is obtained through Notion OAuth and encrypted before storage. Notion uses OAuth 2.0 for public integrations and bearer tokens for API requests.

## Runtime gates

Every Notion operation must:

1. authenticate the MAYA user;
2. resolve the workspace from server-owned identity;
3. verify the selected Client Vault belongs to that workspace;
4. load exactly one active Notion binding for that workspace/client pair;
5. decrypt the credential server-side;
6. confirm the requested Notion resource is shared with that connection;
7. require explicit human approval before import, export, or sync;
8. write an audit event containing workspace, client, binding, action, actor, and outcome.

If any step is unavailable, the operation fails closed.

## Current activation gate

The production branch does not yet expose a server-trusted authenticated-user-to-workspace resolver. Therefore live Notion OAuth and data movement must remain disabled until the persistent session boundary is browser-proven. The connector contract in `lib/connectors/notion/vaultBoundary.ts` prevents a later implementation from substituting a global token or trusting browser identifiers.

## Notion API version

Implement against the current data-source model: databases contain one or more data sources, and pages are children of data sources. Do not assume the pre-2025 single-database schema.
