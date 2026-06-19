import { describe, expect, it } from "vitest";
import {
  getPrimaryCoordinationSection,
  getWorkbenchSection,
  workbenchSections
} from "@maintenance-planning/utils";
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
});
