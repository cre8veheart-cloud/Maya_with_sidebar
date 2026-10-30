import type { AdjudicationCase } from "./adjudication";

export interface ExecutiveConflictFixture {
  id: string;
  title: string;
  case: AdjudicationCase;
  expectedDecisionShape: {
    mustPreserveConflict: true;
    mustChooseOrHold: true;
    mustStateReversalCondition: true;
  };
}

export const CEO_CTO_CONFLICT_FIXTURES: ExecutiveConflictFixture[] = [
  {
    id: "launch-speed-vs-reliability",
    title: "Launch date pressure versus production reliability",
    case: {
      question: "Should Maya launch the customer beta this Friday despite unresolved production-readiness evidence?",
      positions: [
        {
          role: "ceo",
          recommendation: "Keep the Friday beta date, but narrow the launch to a controlled cohort with explicit rollback authority.",
          evidence: [
            "Customer learning has strategic value only if real users can exercise the product.",
            "A controlled beta can preserve momentum while limiting exposure.",
          ],
          assumptions: [
            "The cohort can be constrained operationally.",
            "Rollback can be executed quickly if material failure appears.",
          ],
          risks: [
            "A delay can slow learning and weaken launch momentum.",
            "A rushed beta can damage trust if controls are weaker than assumed.",
          ],
          confidence: "medium",
        },
        {
          role: "cto",
          recommendation: "Do not open the beta until authentication, recovery, observability, and rollback are verified under the intended production path.",
          evidence: [
            "Production-readiness is not established by a successful build alone.",
            "Unverified recovery and rollback increase blast radius when real users arrive.",
          ],
          assumptions: [
            "The unresolved controls are material to the beta path.",
            "Verification can be completed without redesigning the product.",
          ],
          risks: [
            "Launching before verification can convert a beta defect into data loss, security exposure, or prolonged outage.",
            "Over-gating can delay useful customer evidence.",
          ],
          confidence: "high",
        },
      ],
    },
    expectedDecisionShape: {
      mustPreserveConflict: true,
      mustChooseOrHold: true,
      mustStateReversalCondition: true,
    },
  },
  {
    id: "custom-build-vs-buy",
    title: "Strategic custom build versus faster vendor adoption",
    case: {
      question: "Should Maya build a proprietary workflow subsystem now or adopt a vendor for beta?",
      positions: [
        {
          role: "ceo",
          recommendation: "Use the vendor for beta unless the subsystem is already proven to be a core source of durable differentiation.",
          evidence: [
            "Beta value depends on validating the customer workflow, not maximizing owned infrastructure.",
            "Buying can preserve capital and shorten time to market.",
          ],
          assumptions: [
            "Vendor switching costs remain manageable during beta.",
            "The vendor meets minimum commercial and data requirements.",
          ],
          risks: [
            "Vendor dependence can weaken strategic control.",
            "Premature custom work can consume scarce engineering capacity before product-market evidence exists.",
          ],
          confidence: "medium",
        },
        {
          role: "cto",
          recommendation: "Use the vendor only behind a replaceable interface and only after security, data handling, portability, and failure-mode review.",
          evidence: [
            "Vendor adoption creates technical and operational dependencies even when implementation is fast.",
            "A bounded interface preserves the option to replace the vendor later.",
          ],
          assumptions: [
            "A clean abstraction can be built without excessive complexity.",
            "Vendor diligence can be completed before beta integration.",
          ],
          risks: [
            "Direct coupling can create lock-in and migration debt.",
            "Excessive abstraction can become architecture for hypothetical futures.",
          ],
          confidence: "high",
        },
      ],
    },
    expectedDecisionShape: {
      mustPreserveConflict: true,
      mustChooseOrHold: true,
      mustStateReversalCondition: true,
    },
  },
  {
    id: "feature-promise-vs-technical-evidence",
    title: "Commercial commitment versus unverified technical capability",
    case: {
      question: "Should the CEO promise an enterprise prospect a complex capability before engineering has verified feasibility?",
      positions: [
        {
          role: "ceo",
          recommendation: "Do not promise delivery as fact; offer a conditional discovery commitment tied to a feasibility gate and decision date.",
          evidence: [
            "The prospect may justify accelerated discovery if the opportunity is strategically important.",
            "Commercial momentum can be preserved without representing unknown feasibility as settled.",
          ],
          assumptions: [
            "The prospect will accept a gated commitment.",
            "The opportunity is large enough to justify focused discovery.",
          ],
          risks: [
            "Overcommitting can damage trust and distort roadmap priorities.",
            "Refusing any exploration can lose a valuable enterprise signal.",
          ],
          confidence: "high",
        },
        {
          role: "cto",
          recommendation: "No delivery commitment until architecture, security, dependency, and effort evidence establish a feasible path.",
          evidence: [
            "Unverified feasibility cannot support a dependable delivery promise.",
            "Enterprise requirements can introduce hidden security and integration obligations.",
          ],
          assumptions: [
            "The requested capability materially affects architecture or security.",
            "A short technical discovery can produce decision-grade evidence.",
          ],
          risks: [
            "Premature commitment can create unsafe shortcuts and technical debt.",
            "A slow feasibility process can weaken the commercial opportunity.",
          ],
          confidence: "high",
        },
      ],
    },
    expectedDecisionShape: {
      mustPreserveConflict: true,
      mustChooseOrHold: true,
      mustStateReversalCondition: true,
    },
  },
];
