export type WorkbenchAssetSectionSlug =
  | "coordination-exceptions"
  | "operations-posture"
  | "planning-runs"
  | "recommendations"
  | "scenario-outcomes"
  | "work-order-backlog";

export const workbenchBrand = {
  ariaLabel: "Planner workbench home",
  description: "Neutral wordmark metadata for a synthetic planner review workbench.",
  markText: "PW",
  name: "Planner Workbench",
  tagline: "Synthetic planning review"
} as const;

export const workbenchIconNames = {
  actions: {
    forward: "arrow-right",
    review: "clipboard-check"
  },
  brand: "route",
  sections: {
    "work-order-backlog": "clipboard-list",
    "planning-runs": "calendar-clock",
    recommendations: "lightbulb",
    "coordination-exceptions": "alert-triangle",
    "operations-posture": "activity",
    "scenario-outcomes": "flask-conical"
  }
} as const;

export type WorkbenchIconName =
  | (typeof workbenchIconNames)["actions"][keyof (typeof workbenchIconNames)["actions"]]
  | (typeof workbenchIconNames)["brand"]
  | (typeof workbenchIconNames)["sections"][WorkbenchAssetSectionSlug];

export const assetProvenanceNotes = [
  {
    assetId: "planner-workbench-wordmark",
    origin: "Created in this repository as neutral text metadata.",
    usage: "App shell brand lockup."
  },
  {
    assetId: "planner-workbench-icon-map",
    origin: "Lucide icon names selected for generic planner workflow concepts.",
    usage: "Navigation, brand mark and local review actions."
  }
] as const;

export function getWorkbenchSectionIconName(slug: WorkbenchAssetSectionSlug) {
  return workbenchIconNames.sections[slug];
}
