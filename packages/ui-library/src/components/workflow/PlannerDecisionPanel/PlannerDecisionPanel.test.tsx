import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  PlannerDecisionPanel,
  type PlannerDecisionPanelAction
} from "./PlannerDecisionPanel";

const actions: readonly PlannerDecisionPanelAction[] = [
  {
    actionCode: "accept",
    decision: "Accepted",
    description: "Package the ready work order group.",
    label: "Accept package",
    reasonCode: "planner-accepted",
    tone: "success"
  },
  {
    actionCode: "reject:planning-conflict",
    decision: "Rejected",
    description: "Record that this grouping should not move forward.",
    label: "Reject package",
    reasonCode: "planning-conflict",
    tone: "critical"
  },
  {
    actionCode: "defer:missing-parts",
    decision: "Deferred",
    description: "Hold the package while parts availability is reviewed.",
    label: "Missing parts",
    reasonCode: "missing-parts",
    tone: "warning"
  },
  {
    actionCode: "defer:crew",
    decision: "Deferred",
    description: "Hold the package until crew availability is clearer.",
    label: "Crew availability",
    reasonCode: "crew-unavailable",
    tone: "warning"
  }
];

describe("PlannerDecisionPanel", () => {
  it("renders ready decision forms with native hidden ids and an accept submit value", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerDecisionPanel, {
        actions,
        facts: [
          {
            id: "work-orders",
            label: "Work orders",
            value: "3"
          }
        ],
        packageId: "package-1",
        packageNumber: "PKG-READY-001",
        planningRunId: "run-1",
        workOrderIds: ["wo-1", "wo-2"]
      })
    );

    expect(markup).toContain('aria-label="Record planner decision for PKG-READY-001"');
    expect(markup).toContain('aria-describedby="planner-decision-panel-');
    expect(markup).toContain("Accepted selected for PKG-READY-001");
    expect(markup).toContain("Submitting records planner-accepted.");
    expect(markup).toContain('name="packageId"');
    expect(markup).toContain('value="package-1"');
    expect(markup).toContain('name="planningRunId"');
    expect(markup).toContain('name="workOrderIds"');
    expect(markup).toContain('value="accept"');
    expect(markup).toContain('for="notes"');
    expect(markup).toContain('name="notes"');
    expect(markup).toContain("Decision option");
    expect(markup).toContain("Accept package");
    expect(markup).toContain("Ready for decision");
    expect(markup).toContain("<dl");
  });

  it("defaults blocked packages to defer while preserving disabled accept context", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerDecisionPanel, {
        actions: actions.map((action) =>
          action.decision === "Accepted"
            ? {
                ...action,
                disabled: true,
                disabledDescription: "Resolve blockers before accepting."
              }
            : action
        ),
        blockers: [
          {
            id: "parts",
            label: "Parts",
            summary: "Parts availability needs review."
          }
        ],
        packageId: "package-2",
        packageNumber: "PKG-BLOCKED-001",
        workOrderIds: ["wo-3"]
      })
    );

    expect(markup).toContain("Acceptance is blocked");
    expect(markup).toContain("Deferred selected for PKG-BLOCKED-001");
    expect(markup).toContain("Resolve blockers before accepting.");
    expect(markup).toContain('value="defer"');
    expect(markup).toContain("Defer reason");
    expect(markup).toContain('name="deferActionCode"');
    expect(markup).toContain('value="defer:missing-parts"');
    expect(markup).toContain("Missing parts");
    expect(markup).toContain("Parts availability needs review.");
  });

  it("supports an explicit rejected default with a single final submit action", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerDecisionPanel, {
        actions,
        defaultDecision: "Rejected",
        packageId: "package-3",
        packageNumber: "PKG-REVIEW-001",
        secondaryAction: createElement("a", { href: "/recommendations" }, "Back to queue"),
        workOrderIds: ["wo-4"]
      })
    );

    expect(markup).toContain('value="reject:planning-conflict"');
    expect(markup).toContain("Reject package");
    expect(markup).not.toContain('name="deferActionCode"');
    expect(markup).toContain('href="/recommendations"');
  });
});
