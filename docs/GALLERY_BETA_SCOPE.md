# Gallery-first pocket office

Founder direction: gallery and embedded sidebar first; the website is managed
from that sidebar. Maya is a customizable hybrid SaaS/pocket-office platform.
Include durable blob memory for artwork, Adobe/creative assets and client vaults.
Support iPhone/iPad and VPN use without requiring an IP-stable identity.

Executive roles are layered/domain-specific, not a consensus vote: CEO for
direction, CFO finance, CMO marketing and assistant coordination/follow-through.
Maya routes work to relevant roles and preserves meaningful disagreement; no
every-agent-agrees gate is introduced. Existing prompts already reject forced
consensus and are preserved. Human approval governs consequential external actions.

## First implemented slice

`/art-gallery` contains one workspace with Collection, Website, private Website
preview and the existing Mimi assistant. The main Maya sidebar links directly
to Gallery & Website. Collection drafts support artwork metadata, availability,
small uploaded images and explicit website selection. Website settings contain
workspace branding, copy, contact email and light/dark preview themes.
The founder's supplied Freebird Gallery logo is the default preview brand, with
a visibility setting in Website. `public/brand/freebird-gallery.png` is a crop of
the supplied screenshot: phone chrome removed, artwork/lettering unchanged.
This is the founder's current local workspace default, not a global SaaS brand.

Draft edits and private previews never publish. Browser-local persistence,
validated backup export/restore and storage failures are explicitly labelled.
No artwork is fabricated. Mimi's existing provider/auth boundaries are unchanged;
embedding its interface is not proof its AI connection is configured.
Gallery submenu URLs use `?view=collection|website|preview|assistant`, support
direct navigation and browser history, and coexist with the existing pocket-office
menus. Main navigation starts closed on phones without a saved preference and
closes after choosing a destination. Existing saved preferences are preserved.

This slice is new, reversible reconstruction against the recovered archive.
It is not the recovered implementation of original PRs #180–203.

## Shared-platform boundaries

- Gallery customization belongs to the authenticated workspace, not a global
  installation or hard-coded founder account.
- Core authentication, authorization, file storage and audit services are shared;
  a gallery theme/module must not create a parallel account or billing system.
- Store immutable blob identifiers and authorized metadata in the database, not
  expiring signed URLs or image payloads. Reuse file objects across gallery,
  campaigns and Adobe work rather than silently duplicating client assets.
- Distinguish general workspace memory from client-vault memory. A prompt, shared
  assistant or UI selection cannot authorize access to another vault.
- Client-vault confidentiality follows the existing zero-platform-plaintext
  requirement: establish user-held keys/client encryption and recovery/erasure
  behavior before storing private vault material in shared blob infrastructure.
- Adobe integration is not a website link or uploaded image. It needs its own
  verified authorization, supported file operations and user-approved external
  actions. No Adobe connection or professional file-format support is claimed.

## Required before beta

The current gallery uses a **single browser-local draft**, not tenant-isolated
storage. It is not a place for confidential client data and cannot be released
as multi-account SaaS in this state.

1. Identify and preserve the existing Neon database and original source around
   PRs #201–203 (fallback: useful work after #179); do not replace them blindly.
2. Verify authenticated workspace membership server-side for every data/blob
   operation. Never accept a client-supplied account/vault ID as authorization.
3. Select/connect existing blob infrastructure with owner approval. Implement
   bounded uploads, content/type verification, quotas, encrypted private assets,
   short-lived authorized reads and deletion. No new paid bucket is created here.
4. Persist gallery settings, collection records and file references with tenant
   isolation, migration, recovery/export and cross-device tests. Verify vault
   denial cases and distinguish saved metadata from completed blob uploads.
5. Verify existing Adobe access and supported import/export behavior separately.
6. Add explicit owner-approved publishing/version rollback. Private vault
   assets must never enter a public gallery merely because they exist in storage.
7. Test the final login/upload/save/recovery flow on iPhone/iPad and a real VPN.
   Do not bind tenant identity/session validity to IP/geolocation. Keep normal
   session-expiry, revocation and risk controls; do not promise zero challenges
   from third-party providers. VPN compatibility remains unverified here.

Browser draft size limits (100 artworks, 1 MB images, 3 MB JSON) are temporary
prototype limits, not a scalable blob storage architecture or beta quota design.
No public site, DNS change, account, bucket or paid subscription is introduced.
