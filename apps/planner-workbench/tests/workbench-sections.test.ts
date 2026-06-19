import { describe, expect, it } from "vitest";
import {
  getPrimaryCoordinationSection,
  getWorkbenchSection,
  workbenchSections
} from "@maintenance-planning/utils";
import { PlannerServiceRequestError } from "@maintenance-planning/services";
import {
  normaliseDecisionNotes,
  resolvePlannerDecisionAction
} from "../lib/planner-decisions";
import {
  buildBacklogMetrics,
  buildRecommendationMetrics,
  formatHours,
  formatUtc,
  toneForDecision
} from "../lib/planner-format";
import { toPlannerRouteIssue } from "../lib/planner-route-state";
import { coordinationQueueItems, plannerConsoleSummary } from "../lib/planner-console-data";

describe("workbench section model", () => {
  it("defines the planner task routes in a stable order", () => {
    expect(workbenchSections.map((section) => section.path)).toEqual([
      "/work-order-backlog",
      "/planning-runs",
      "/recommendations",
      "/coordination-exceptions",
      "/operations-posture",
      "/scenario-outcomes"
    ]);
  });

  it("selects coordination exceptions as the home focus", () => {
    expect(getPrimaryCoordinationSection().slug).toBe("coordination-exceptions");
  });

  it("returns route metadata by slug", () => {
    expect(getWorkbenchSection("recommendations").label).toBe("Recommendations");
    expect(getWorkbenchSection("recommendations").placeholderBody).toContain(
      "planner service boundary"
    );
  });

  it("keeps the home console centered on coordination work", () => {
    expect(plannerConsoleSummary.map((item) => item.label)).toEqual([
      "Needs coordination",
      "Ready without blocker",
      "Deferred for review"
    ]);
    expect(coordinationQueueItems).toHaveLength(5);
    expect(coordinationQueueItems.every((item) => item.workOrderNumber.startsWith("WO-"))).toBe(
      true
    );
  });

  it("maps planner decision controls to API-shaped command values", () => {
    expect(resolvePlannerDecisionAction("accept")).toMatchObject({
      decision: "Accepted",
      reasonCode: "planner-accepted"
    });
    expect(resolvePlannerDecisionAction("defer:missing-parts")).toMatchObject({
      decision: "Deferred",
      reasonCode: "missing-parts"
    });
    expect(normaliseDecisionNotes("  review after parts check  ")).toBe(
      "review after parts check"
    );
  });

  it("formats planner metrics and state labels", () => {
    expect(formatUtc("2026-01-15T10:30:00.000Z")).toBe("2026-01-15 10:30 UTC");
    expect(formatHours(null)).toBe("No estimate");
    expect(toneForDecision("Rejected")).toBe("critical");
    expect(
      buildBacklogMetrics({
        generatedAtUtc: "2026-01-15T08:00:00.000Z",
        counts: {
          blocked: 1,
          deferred: 1,
          ready: 2,
          total: 4
        },
        items: []
      }).map((item) => `${item.label}:${item.value}`)
    ).toEqual(["Ready:2", "Blocked:1", "Deferred:1"]);
    expect(
      buildRecommendationMetrics({
        planningRunId: "run-id",
        runNumber: "RUN-001",
        status: "Completed",
        recommendations: []
      }).map((item) => item.label)
    ).toEqual(["Ready packages", "Cannot package yet", "Decision history"]);
  });

  it("classifies unauthorized planner service errors for route states", () => {
    expect(toPlannerRouteIssue(new PlannerServiceRequestError(403, "Forbidden"))).toMatchObject({
      kind: "unauthorized",
      title: "Planner access needs attention"
    });
  });
});
