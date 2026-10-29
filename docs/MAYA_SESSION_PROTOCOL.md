# MAYA SESSION PROTOCOL

Status: Working continuity protocol
Owner: Founder
Technical lead: Ari / CTO

## Purpose

Keep Maya work recoverable across sessions without reconstructing the project from conversation history.

## Code Phrase

**DIH EVENT MAYA**

When this phrase is used, treat it as a request to recover the canonical Maya working context and continue from the latest recorded checkpoint.

Recovery sequence:
1. Locate the canonical private Maya repository.
2. Locate the current Maya architecture blueprint and active working branch/PR.
3. Read the latest session checkpoint.
4. Confirm the last completed build edge, unresolved decisions, and next approved action.
5. Continue from that point unless the Founder changes direction.

## Canonical Architecture Source

Primary blueprint:

`docs/MAYA_ARCHITECTURE_BLUEPRINT_V1.md`

The architecture blueprint is the source of truth for:
- Maya Core
- Executive Suite
- Shared Maya Services
- Whiteboard Room
- Maya Live / Office Meetings
- Podcast and presentation modes
- Art Gallery / Viewing Room / Immersive Projection Room
- Menu/navigation architecture
- Shared object rules
- Permission rules
- Build order
- Decision gates

Related visual/product blueprints should remain associated with the Maya architecture rather than becoming independent competing specifications.

## Session Checkpoint Rule

Before a Maya build session ends, record:
- Date/time
- Current branch and PR
- What was built or changed
- What was tested
- What passed/failed
- Security/permission changes
- Open architectural decisions
- Exact next build step

A chat session ending must not be treated as the end of Maya's working state.

## Working Branch Rule

Use one canonical Maya working branch/PR for the active architecture work whenever practical. Do not create duplicate Maya repositories or shadow deployments merely to continue work.

## Build-vs-Chat Rule

A Maya conversation does not itself authorize a code change. Design discussion can remain conversational. Code changes occur only when the Founder explicitly asks to build, implement, fix, test, commit, merge, deploy, or otherwise act on the repository.

## Decision Gate Rule

When an implementation choice has meaningful tradeoffs, stop before hard-wiring it. Present the viable options, consequences, and CTO recommendation, then record the chosen decision in the architecture blueprint.

## Continuity Principle

Ari should preserve durable Maya working context across sessions to the extent supported by the system. The repository blueprint and session checkpoints provide the concrete source of truth when conversational memory is incomplete.

## Current Recovery Target

Workspace: **ChatGPT Codex coding workspace**

Canonical repository: **`cre8veheart-ai/Maya_with_sidebar`** (private)

Canonical production branch: **`main`**

Canonical Vercel project: **`maya-with-sidebar`** under team **`mayav11`**

Latest verified production deployment at checkpoint:
- State: **READY**
- Commit: **`2dd925765687630c3b242fd519ad4321d6a44422`**
- Change: Restore protected chat API boundary (#84)

Active continuity branch: **`ari/dih-coding-workspace-checkpoint`**

Detailed live handoff: **`docs/DIH_WORKSPACE_CHECKPOINT.md`**

Current completed build edge:
1. Standalone Max / CEO chassis and adversarial gates
2. Standalone Ari / CTO operating clone and delivery command center
3. Erica / CMO and Dana / CFO chassis verification
4. CEO + CTO adjudication and conflict gates
5. Protected beta session and `/api/chat` server boundary
6. One canonical private GitHub repository and one canonical Vercel project

Next approved build package:
1. Establish persistent workspace storage behind server-owned APIs
2. Replace browser-only persistence for profiles, sessions, executive work, and saved activity
3. Preserve human approval for external connector actions
4. Add verification gates before merging or deploying

Backend decision gate:
- Production currently uses Upstash Redis for invite redemption and session controls.
- Supabase was selected for durable MAYA memory and vault storage.
- Do not collapse these into one store merely for convenience. Keep security/session control and durable product data behind explicit adapters.

## North Star

**Stable Core -> Modular Capabilities -> Shared Services -> Controlled Connections -> One Source of Truth**

Maya should feel like one seamless Pocket Office while remaining modular, testable, secure, and replaceable under the hood.
