import { describe, expect, it } from "vitest";
import {
  getPrimaryCoordinationSection,
  getWorkbenchSection,
  workbenchSections
} from "@maintenance-planning/utils";

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
});
