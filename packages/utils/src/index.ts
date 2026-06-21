export type Tone = "critical" | "info" | "neutral" | "success" | "warning";

export type WorkbenchSectionSlug =
  | "work-order-backlog"
  | "planning-runs"
  | "recommendations"
  | "coordination-exceptions"
  | "operations-posture"
  | "scenario-outcomes";

export type PlannerTask = {
  detail: string;
  label: string;
  status: string;
  tone: Exclude<Tone, "critical">;
};

export type WorkbenchSection = {
  coordinationCue: string;
  label: string;
  metric: {
    detail: string;
    label: string;
    tone: Exclude<Tone, "critical">;
    value: string;
  };
  navGroup: "Evidence" | "Review";
  navHint: string;
  path: `/${WorkbenchSectionSlug}`;
  placeholderBody: string;
  placeholderTasks: PlannerTask[];
  placeholderTitle: string;
  slug: WorkbenchSectionSlug;
  summary: string;
  tone: Tone;
};

export const workbenchSections = [
  {
    slug: "recommendations",
    label: "Recommendations",
    path: "/recommendations",
    navGroup: "Review",
    navHint: "Package decisions",
    summary:
      "A package recommendation queue for reviewing explanations, blockers and planner decisions.",
    coordinationCue: "Open one package to understand readiness and record a decision.",
    tone: "warning",
    metric: {
      label: "Packages",
      value: "2",
      detail: "Current synthetic package recommendations for review.",
      tone: "warning"
    },
    placeholderTitle: "Decision review",
    placeholderBody:
      "Decision controls record accept, reject and defer outcomes through the planner service boundary.",
    placeholderTasks: [
      {
        label: "Ready package",
        detail: "Package can move forward after planner review.",
        status: "Ready",
        tone: "success"
      },
      {
        label: "Blocked package",
        detail: "Package needs coordination before acceptance.",
        status: "Review",
        tone: "warning"
      }
    ]
  },
  {
    slug: "work-order-backlog",
    label: "Work-order backlog",
    path: "/work-order-backlog",
    navGroup: "Review",
    navHint: "Work-order triage",
    summary:
      "A focused triage view for imported synthetic work orders, readiness and package links.",
    coordinationCue: "Filter work orders by readiness and open the related package.",
    tone: "info",
    metric: {
      label: "Backlog items",
      value: "2",
      detail: "Synthetic work orders in the current planner service response.",
      tone: "info"
    },
    placeholderTitle: "Backlog triage",
    placeholderBody:
      "This route reviews work-order grouping, constraints and decision state through the planner service boundary.",
    placeholderTasks: [
      {
        label: "Ready for planning",
        detail: "Synthetic orders with a clear planning path.",
        status: "Ready",
        tone: "success"
      },
      {
        label: "Blocked by dependency",
        detail: "Items waiting on coordination details.",
        status: "Watch",
        tone: "warning"
      }
    ]
  },
  {
    slug: "coordination-exceptions",
    label: "Coordination exceptions",
    path: "/coordination-exceptions",
    navGroup: "Review",
    navHint: "Exception filter",
    summary:
      "A filtered work-order triage route for blockers, deferrals and source-data gaps.",
    coordinationCue: "Work through the items most likely to block planning flow.",
    tone: "critical",
    metric: {
      label: "Exceptions",
      value: "1",
      detail: "Synthetic coordination items requiring attention.",
      tone: "warning"
    },
    placeholderTitle: "Exception queue",
    placeholderBody:
      "This route keeps coordination work visible while source-system-shaped details stay synthetic.",
    placeholderTasks: [
      {
        label: "Missing estimate",
        detail: "Estimated effort needs source-data review.",
        status: "Review",
        tone: "warning"
      },
      {
        label: "Deferred decision",
        detail: "Planner rationale remains visible.",
        status: "Hold",
        tone: "info"
      }
    ]
  },
  {
    slug: "operations-posture",
    label: "Operations posture",
    path: "/operations-posture",
    navGroup: "Evidence",
    navHint: "Trust summary",
    summary:
      "A planner-visible trust summary for freshness, source-data readiness and latest import state.",
    coordinationCue: "Scan posture signals before starting deeper review.",
    tone: "neutral",
    metric: {
      label: "Posture",
      value: "Healthy",
      detail: "Synthetic review evidence is available.",
      tone: "info"
    },
    placeholderTitle: "Readiness view",
    placeholderBody:
      "The page shows API-owned posture state without implying live service connectivity.",
    placeholderTasks: [
      {
        label: "Data freshness",
        detail: "Latest synthetic import state.",
        status: "Fresh",
        tone: "success"
      },
      {
        label: "Review cadence",
        detail: "Planner-facing readiness signals.",
        status: "Ready",
        tone: "info"
      }
    ]
  },
  {
    slug: "scenario-outcomes",
    label: "Scenario outcomes",
    path: "/scenario-outcomes",
    navGroup: "Evidence",
    navHint: "Scenario evidence",
    summary:
      "A scenario evidence view for deterministic synthetic outcomes and stale/rejected counts.",
    coordinationCue: "Compare synthetic outcomes across review scenarios.",
    tone: "info",
    metric: {
      label: "Scenarios",
      value: "3",
      detail: "Synthetic outcome rows in the current review set.",
      tone: "info"
    },
    placeholderTitle: "Outcome review",
    placeholderBody:
      "Scenario evidence stays synthetic and local unless API-backed verification is explicitly added.",
    placeholderTasks: [
      {
        label: "Baseline scenario",
        detail: "Expected planner outcomes.",
        status: "Ready",
        tone: "success"
      },
      {
        label: "Exception scenario",
        detail: "Coordination-heavy outcome evidence.",
        status: "Review",
        tone: "info"
      }
    ]
  },
  {
    slug: "planning-runs",
    label: "Planning runs",
    path: "/planning-runs",
    navGroup: "Evidence",
    navHint: "Run context",
    summary:
      "A planner-visible run view for current recommendation context.",
    coordinationCue: "Check which run anchors the current recommendation review.",
    tone: "success",
    metric: {
      label: "Current run",
      value: "1",
      detail: "Current service-supplied planning run.",
      tone: "success"
    },
    placeholderTitle: "Run review",
    placeholderBody:
      "This area shows service-owned run state, package counts and planner review context.",
    placeholderTasks: [
      {
        label: "Latest run",
        detail: "Synthetic run summary for local review.",
        status: "Current",
        tone: "success"
      },
      {
        label: "Run detail",
        detail: "Recommendation package context.",
        status: "Open",
        tone: "info"
      }
    ]
  }
] as const satisfies readonly WorkbenchSection[];

export function getWorkbenchSection(slug: WorkbenchSectionSlug): WorkbenchSection {
  const section = workbenchSections.find((candidate) => candidate.slug === slug);

  if (!section) {
    throw new Error(`Unknown workbench section: ${slug}`);
  }

  return section;
}

export function getPrimaryCoordinationSection(): WorkbenchSection {
  return getWorkbenchSection("recommendations");
}
