# MAYA Pocket Office — Build Capability Roadmap

Status: Non-binding product and feature roadmap. Describes planned, possible and under-discussion MAYA capabilities. This document does not gate, require, restrict, or grant authority to any engineering agent — it is a planning reference only. Binding operating rules for agents live in `AGENTS.md`; binding product/architecture decisions come from Leslie directly.
Owner: Leslie (Founder).
Maintained by: Ari, under Founder direction, subject to review and correction at any time.

## What this document is

This is where MAYA's forward-looking product architecture and Pocket Office capability planning lives: what executives, shared services, workspaces and modules are planned, what order they might be built in, and what open design questions remain. Nothing here is committed, approved for autonomous build, or a substitute for asking Leslie before doing consequential work. Section numbering below is preserved from the original combined blueprint document for traceability; engineering history, the tool-authorization register and agent access-control rules now live separately in `docs/MAYA_ARCHITECTURE_BLUEPRINT_V1.md` (renamed in practice to MAYA Engineering Notes & History) and in `AGENTS.md`.

This document was split out of the original "Maya Architecture Blueprint v1.0" on 2026-09-22, after Leslie identified that document's "build authority" framing had been applied to this planning content without her having reviewed that specific framing decision. See the Engineering Notes & History file for the full record of that correction.

## 3. Executive Suite — Standalone Plug-ins

Each executive is a standalone agent module with its own:
- Identity and executive contract
- Scope and authority
- Role-specific reasoning instructions
- Model/runtime configuration
- Tool permissions
- Context and memory boundaries
- Tests/evals
- Structured interface back to Maya

Maya coordinates executives; executives do not depend on being embedded inside Maya Core.

Planned executive modules:
- CEO — reference/gold-standard executive chassis; build first
- CTO — architecture, security, engineering, deployment, technical risk
- CFO — budget, runway, ROI, pricing economics, financial risk
- CMO — market, positioning, GTM, campaigns, growth strategy
- COO — operations, delivery, dependencies, execution
- CIO — information architecture, data strategy, intelligence
- CRO — revenue, pipeline, conversion, expansion
- Creative Director — visual/message quality and brand execution
- HR — people operations and workforce policy
- Legal — contracts/compliance review and legal-risk flagging
- Office Admin — routine office coordination and approved execution
- Executive Assistant — founder-facing triage, scheduling, preparation and follow-through

Strategy Room is an orchestration surface, not an executive. Executives analyze independently; Maya weighs disagreement and adjudicates rather than averaging.

Titans Council remains Phase 2 until the ordinary Strategy Room is proven.

## 4. Shared Maya Services

Executives use shared services through controlled interfaces. Shared capabilities are built once and are not duplicated inside each executive.

### Email
Shared communication service for read, draft, queue, approval, send and thread linkage.
Connects to: Executive Assistant, Office Admin, CMO, CEO, Client Vaults, Campaigns, Projects.
Architecture choice later: provider adapter strategy and external-send approval thresholds.

### Campaigns
One campaign engine for planning, assets, approvals, scheduling, execution and results.
Connects to: CMO, Creative Director, Legal, CFO, Analytics, Email, Website.
Rule: CMO owns campaign strategy; Campaign Service owns execution plumbing.

### Projects
Project containers, milestones, owners, dependencies, status and linked artifacts.
Connects to: COO, CTO, CEO, Executive Assistant, Tasks, Meetings, Whiteboard.

### Client Vaults
Client-specific documents, history, decisions, campaigns and controlled context.
Connects to: every MAYA executive and menu tool, Projects, Library, Email, Meetings and the Pocket Desk.

Authoritative workspace and memory rules:
- MAYA remains fully available in General mode with no client active.
- Executives maintain persistent user memory independent of clients: user-approved preferences, working style, goals, decisions, general projects and prior General sessions.
- Signing a client in activates the complete MAYA Pocket Office for that client; it does not limit which executives or menu tools are available.
- Multiple clients may remain active simultaneously on the Pocket Desk, but exactly one workspace is foreground-selected at a time: General or one active client.
- Selecting a client supplies that client's authorized business information, Library, imported materials, projects, sessions, prior work, decisions, recommendations and client memory as context for executive answers.
- In client mode, executive context is user memory plus only the foreground-selected client's authorized context. Active background clients contribute zero context.
- New memories and work created in a client workspace are scoped and filed only to that client and project.
- Client information never enters user/general memory without an explicit user-directed promotion.
- Switching clients atomically replaces prompt context, retrieval results, caches, drafts, memory namespace and filing destination; no cross-client blending is permitted.
- Signing a client out files and closes only that client. If no clients remain selected, MAYA returns to General mode with all tools available and user memory intact.
- Leaving MAYA files and signs out every active client independently, clears decrypted client state and keys, and returns client names to greyed-out.
- Client vault removal, transfer or erasure never deletes the user's General memory.

Vault rule: optional client-side encryption, user-held credentials and keys, zero RAIN plaintext access, strong tenant isolation, user-directed portability and permanent erasure.

### Website Dashboard
Maya-native control surface for website content, status, analytics and approved publishing.
Connects to: CMO, Creative Director, CTO, Analytics.
Recommended staged authority: read/preview first; controlled publish later.

### Calendar
Shared meetings, availability, reminders and approved scheduling.
Connects to: Executive Assistant, Office Admin, COO, Projects, Maya Live.

### Phone + Alerts
Founder-facing alert surface.
Green = answered/complete. Yellow = waiting.
Keep alerts minimal: person/item + state + tap-through to underlying work.

### Analytics / Intel
Shared evidence and intelligence service.
Connects to: CIO, CFO, CMO, CRO, Vaults, Campaigns, Website.
Rule: separate raw data adapters from executive interpretation.

## 5. Whiteboard Room — Visual Workbench

Whiteboard Room is a first-class Maya workspace, not just a drawing page.

Core capabilities:
- Persistent collaborative canvases
- Freeform notes, diagrams, decision cards, assets and files
- Campaign boards
- Strategy boards
- Creative/mood boards
- Art curation boards
- Live-build boards
- Saved boards/stacks
- Reusable templates

Presentation rule:
Whiteboard work should be structurally exportable into presentation form without rebuilding from scratch.

Planned presentation outputs:
- PowerPoint-compatible deck generation/export
- PDF briefing
- Presenter mode

Architectural decision later: PowerPoint-native generation vs structured deck model with exporters.

## 6. Maya Live — Human + AI Collaboration Platform

Maya owns the branded experience. External infrastructure may power selected realtime plumbing behind the curtain.

Modes:
- Office Meetings
- Presentation Mode
- Podcast Mode
- Later: Broadcast/Webinar Mode

### Office Meetings
Humans and AI agents can join by invitation.

Meeting flow:
Invite Portal -> Lobby -> Live Room -> Workspaces -> Decisions/Tasks/Artifacts -> Follow-up

Host controls:
- Invite/remove participants
- Mic on/mute
- Camera on/off
- Mute all
- Screen sharing
- Workspace sharing
- Make Presenter / revoke presenter
- Recording controls if enabled
- End meeting

Human guests/vendors:
- Meeting-scoped access only
- No inherited access to Maya, executives, secrets, GitHub, vaults or other projects

AI participants:
- Can be active/silent
- Can present/observe
- Can share approved workspaces when host-authorized
- Do not gain broader permissions because they joined a meeting

Security rule:
An invitation grants access to the meeting, not to Maya.

### Presentation Mode
Clean presenter surface for slides, Whiteboard, project demos and live builds.
Editing clutter hidden while presenting.

### Podcast Mode
Maya-branded live podcast environment with:
- Host + human guests + AI executive/agent guests
- Green room/backstage
- Mic controls
- Screen/media sharing
- Recording
- Transcript if enabled
- Chapter markers
- Clips/highlights
- Show notes
- Post-show assets to Library

External distribution destinations are modular and decided later.

## 7. Art Gallery Module

The Art Gallery is a real HTML website/module, not a Whiteboard page.

Separation of concerns:
- Gallery = destination
- Whiteboard = curation/workspace
- Viewing Room = immersive inspection
- Projection Room = immersive exhibition experience

### HTML Gallery
Public or selectively private gallery website.
Supports artwork, collections, statements and exhibition navigation.

### Viewing Room
A client can take an individual piece into a dedicated room.

Capabilities:
- Virtual gallery-light dimmer
- Ambient lighting controls
- Focused artwork illumination
- Wall/background presentation options
- Scale/zoom
- Optional frame/mat visualization
- Title and artist statement

Rule: environmental lighting changes must not alter the underlying artwork file.

### Immersive Projection Room
Van-Gogh-experience-style presentation layer.

Capabilities may include:
- Large-scale projection across virtual walls/surfaces
- Multi-surface layouts
- Sequenced works
- Transitions
- Optional sound/narration
- Virtual preview of a physical exhibition package

Later decision gates:
- Browser-only immersive mode
- Actual projector output
- Multi-projector synchronization
- Projection mapping
- AR/room-scale visualization

## 8. Core Menu / Navigation Frame

Current known menu structure includes:

Core:
- Home
- Community
- Tasks
- Search

Executive Suite:
- CEO
- COO
- CMO
- CFO
- CTO
- CIO
- CRO
- Creative Director
- HR
- Legal
- Office Admin
- Strategy Room
- Titans Council (Phase 2)

Library:
- Sessions
- Saved Files
- Knowledge Vault
- Intel Vault

Operations:
- Decisions
- Campaigns
- Tool Sandbox

Platform:
- Settings

Planned/additional Pocket Office menu capabilities:
- Whiteboard Room (foldout)
- Projects
- Client Vaults
- Email
- Website Dashboard
- Maya Live / Office Meetings
- Calendar
- Phone + Alerts
- Executive Assistant
- Art Gallery

Menu rule: avoid top-level clutter. Use foldouts for related workspaces and modes.

## 9. Data and Object Rules

Prefer shared objects rather than copies.
Examples:
- One Task object referenced by Project, Executive and Meeting
- One File object referenced by Campaign, Client Vault and Whiteboard
- One Decision record referenced by Strategy Room, Project and Session
- One Email thread linked to Client, Campaign and Project as needed

This prevents fragmentation and duplicate truth.

## 10. Permission Rules

Default: least privilege.

Permissions are scoped separately for:
- Reading
- Drafting
- Editing
- Sending/publishing
- Tool execution
- Financial actions
- Repository/deployment actions
- Meeting participation
- Screen/workspace sharing
- Client/Vault access

Speaking/presenting permission never implies data/tool permission.
Meeting access never implies platform access.
Executive authority never bypasses Maya Core security policy.

## 11. Build Order

1. Freeze/maintain Maya Core
2. CEO standalone chassis
3. CEO adversarial/eval tests
4. CTO standalone module
5. CEO + CTO Strategy Room conflict tests
6. CFO
7. CMO
8. COO
9. CRO
10. CIO
11. Creative Director
12. Legal / HR / Admin / Executive Assistant
13. Shared services in priority order
14. Whiteboard Room
15. Maya Live / Office Meetings
16. Art Gallery + Viewing Room
17. Immersive Projection Room
18. Broader broadcast/distribution capabilities

The build order may change for product priority, but architecture rules stay stable.

## 12. Decision Gates — Discuss Before Locking

The following are intentionally undecided until implementation requires them:
- OpenClaw/runtime strategy per executive
- Base model/provider per executive
- Realtime meeting infrastructure
- Video/audio/screen-share provider
- PowerPoint generation/export architecture
- Email provider adapter architecture
- Database/storage choices for new services
- Realtime Whiteboard collaboration technology
- Recording/transcription stack
- External livestream/podcast destinations
- Projector/multi-projector implementation
- AR support
- Whether any module later deserves its own repository/deployment

At each gate: present viable options, consequences, recommendation, then choose deliberately.

## 13. Architectural North Star

Stable Core -> Modular Capabilities -> Shared Services -> Controlled Connections -> One Source of Truth

Maya should feel like one seamless Pocket Office while remaining modular, testable, secure and replaceable under the hood.


