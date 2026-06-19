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
    slug: "work-order-backlog",
    label: "Work-order backlog",
    path: "/work-order-backlog",
    navHint: "Ready, blocked and waiting",
    summary:
      "A focused backlog shell for reviewing synthetic work orders before planner action.",
    coordinationCue: "Confirm ready work and isolate blocked items.",
    tone: "info",
    metric: {
      label: "Backlog placeholder",
      value: "18",
      detail: "Synthetic items grouped for review.",
      tone: "info"
    },
    placeholderTitle: "Backlog triage",
    placeholderBody:
      "This route reserves space for work-order grouping, constraints and review state without calling a backend.",
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
    slug: "planning-runs",
    label: "Planning runs",
    path: "/planning-runs",
    navHint: "Recent run context",
    summary:
      "A route shell for planner-visible run history, readiness checks and review cadence.",
    coordinationCue: "Check which run should anchor the next review.",
    tone: "success",
    metric: {
      label: "Run shell",
      value: "3",
      detail: "Example run slots ready for later service data.",
      tone: "success"
    },
    placeholderTitle: "Run review",
    placeholderBody:
      "This area will hold run state, timing and planner notes when the service boundary is added.",
    placeholderTasks: [
      {
        label: "Latest run",
        detail: "Synthetic run summary for local review.",
        status: "Current",
        tone: "success"
      },
      {
        label: "Prior run comparison",
        detail: "Reserved for variance review.",
        status: "Queued",
        tone: "info"
      }
    ]
  },
  {
    slug: "recommendations",
    label: "Recommendations",
    path: "/recommendations",
    navHint: "Accept, defer or reject",
    summary:
      "A recommendation workbench shell for future planner decisions over API-supplied options.",
    coordinationCue: "Review recommendation placeholders before decisions are wired.",
    tone: "warning",
    metric: {
      label: "Decision slots",
      value: "7",
      detail: "Synthetic slots for future recommendation review.",
      tone: "warning"
    },
    placeholderTitle: "Decision review",
    placeholderBody:
      "Decision controls are intentionally absent until the service contracts are introduced.",
    placeholderTasks: [
      {
        label: "Review candidate",
        detail: "Placeholder for a future recommendation card.",
        status: "Review",
        tone: "warning"
      },
      {
        label: "Deferred item",
        detail: "Placeholder for planner rationale capture.",
        status: "Later",
        tone: "info"
      }
    ]
  },
  {
    slug: "coordination-exceptions",
    label: "Coordination exceptions",
    path: "/coordination-exceptions",
    navHint: "Items needing follow-up",
    summary:
      "A route shell for mismatches, missing details and coordination items that need planner attention.",
    coordinationCue: "Work through the items most likely to block planning flow.",
    tone: "critical",
    metric: {
      label: "Exceptions",
      value: "5",
      detail: "Synthetic coordination items requiring attention.",
      tone: "warning"
    },
    placeholderTitle: "Exception queue",
    placeholderBody:
      "This route keeps coordination work visible while later stages add source-system-shaped details.",
    placeholderTasks: [
      {
        label: "Window mismatch",
        detail: "Planning window needs a coordinator review.",
        status: "Review",
        tone: "warning"
      },
      {
        label: "Missing dependency",
        detail: "Dependency detail is waiting on confirmation.",
        status: "Hold",
        tone: "info"
      }
    ]
  },
  {
    slug: "operations-posture",
    label: "Operations posture",
    path: "/operations-posture",
    navHint: "Readiness indicators",
    summary:
      "A compact route shell for future readiness, latency and planner-facing service indicators.",
    coordinationCue: "Scan posture signals before starting deeper review.",
    tone: "neutral",
    metric: {
      label: "Posture checks",
      value: "4",
      detail: "Synthetic indicators for layout review.",
      tone: "info"
    },
    placeholderTitle: "Readiness view",
    placeholderBody:
      "The page reserves space for API-owned posture state without implying live service connectivity.",
    placeholderTasks: [
      {
        label: "Data freshness",
        detail: "Placeholder for service-supplied freshness.",
        status: "Mock",
        tone: "info"
      },
      {
        label: "Review cadence",
        detail: "Placeholder for planner workflow timing.",
        status: "Mock",
        tone: "info"
      }
    ]
  },
  {
    slug: "scenario-outcomes",
    label: "Scenario outcomes",
    path: "/scenario-outcomes",
    navHint: "Synthetic scenario evidence",
    summary:
      "A route shell for scenario result review once deterministic simulator outputs are connected.",
    coordinationCue: "Compare synthetic outcomes across review scenarios.",
    tone: "info",
    metric: {
      label: "Scenario shells",
      value: "6",
      detail: "Reserved outcome rows for reviewer flow.",
      tone: "info"
    },
    placeholderTitle: "Outcome review",
    placeholderBody:
      "Scenario evidence stays synthetic and local until API-backed verification is explicitly added.",
    placeholderTasks: [
      {
        label: "Baseline scenario",
        detail: "Reserved row for expected planner outcomes.",
        status: "Ready",
        tone: "success"
      },
      {
        label: "Exception scenario",
        detail: "Reserved row for coordination-heavy outcomes.",
        status: "Mock",
        tone: "info"
      }
    ]
  }
] as const satisfies readonly WorkbenchSection[];

export const plannerSummaryItems = [
  {
    label: "Coordination focus",
    value: "5",
    detail: "Synthetic exceptions surfaced first.",
    tone: "warning"
  },
  {
    label: "Ready to review",
    value: "18",
    detail: "Placeholder backlog items in scope.",
    tone: "success"
  },
  {
    label: "Scenario shells",
    value: "6",
    detail: "Outcome routes ready for later data.",
    tone: "info"
  }
] as const;

export function getWorkbenchSection(slug: WorkbenchSectionSlug): WorkbenchSection {
  const section = workbenchSections.find((candidate) => candidate.slug === slug);

  if (!section) {
    throw new Error(`Unknown workbench section: ${slug}`);
  }

  return section;
}

export function getPrimaryCoordinationSection(): WorkbenchSection {
  return getWorkbenchSection("coordination-exceptions");
}
