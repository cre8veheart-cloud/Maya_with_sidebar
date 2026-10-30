# MAYA Reject Pile

A deliberate record of patterns, tools, artifacts, and architectural approaches that MAYA has rejected.

This is **not** a storage pile for dead code. Git history is the archive. The reject pile records the lesson so we do not accidentally reintroduce the failure mode.

## Rejected: DIH
**Status:** Prohibited / HR write-up offense.

No improvisational production surgery. Changes must be deliberate, inspectable, testable, bounded, and reversible.

## Rejected: Backdoor renegades
**Status:** Prohibited.

No shadow deployment paths, mystery credentials, undocumented privileged access, direct-to-production cowboy changes, or delegated agents bypassing architecture/release gates.

Legitimate emergency recovery must use documented, controlled, auditable break-glass procedures.

## Rejected: Copilot participation in MAYA engineering
**Status:** Retired from workflow.

Historical code is judged on independent inspection and verification. No tool or agent gets credit merely for claiming a change is fixed, tested, deployed, or production-ready.

## Rejected: Self-certifying AI
**Status:** Prohibited.

No AI—including Ari or delegated workstreams—may treat its own assertion of success as evidence. Claims require system evidence: diff, test output, CI state, deployment state, or direct verification.

## Rejected: Cruft / Claude phruuuumpppft
**Status:** Remove or consolidate.

Stale handoff docs, obsolete deployment notes, duplicate instructions, abandoned scaffolding, and superseded status files do not remain in the active working surface merely because they once had value.

## Rejected: Strangulated crumft
**Status:** Surgical removal.

Obsolete material entangled with functioning code must be dependency-checked, extracted carefully, verified, and then trashed. Never preserve it indefinitely because removal feels scary.

## Core rule
**One MAYA. One production truth. One understandable path forward.**

Useful history stays in Git. Operational truth stays current. Trash goes to trash.
