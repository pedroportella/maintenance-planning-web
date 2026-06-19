import { describe, expect, it } from "vitest";
import {
  assetProvenanceNotes,
  getWorkbenchSectionIconName,
  workbenchBrand,
  workbenchIconNames,
  type WorkbenchAssetSectionSlug
} from "../src";

const sectionSlugs: WorkbenchAssetSectionSlug[] = [
  "work-order-backlog",
  "planning-runs",
  "recommendations",
  "coordination-exceptions",
  "operations-posture",
  "scenario-outcomes"
];

describe("ui asset metadata", () => {
  it("owns the workbench wordmark metadata", () => {
    expect(workbenchBrand.name).toBe("Planner Workbench");
    expect(workbenchBrand.tagline).toContain("Synthetic");
    expect(workbenchBrand.description).toContain("Neutral");
    expect(workbenchBrand.markText).toBe("PW");
  });

  it("maps every planner section to a generic icon name", () => {
    expect(Object.keys(workbenchIconNames.sections)).toEqual(sectionSlugs);

    for (const slug of sectionSlugs) {
      expect(getWorkbenchSectionIconName(slug)).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
    }
  });

  it("documents local provenance for brand and icon assets", () => {
    expect(assetProvenanceNotes.map((note) => note.assetId)).toEqual([
      "planner-workbench-wordmark",
      "planner-workbench-icon-map"
    ]);

    for (const note of assetProvenanceNotes) {
      expect(note.origin).not.toMatch(/external brand|production/i);
    }
  });
});
