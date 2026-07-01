export type PlannerRouteAccessibilityFixture = {
  readonly disclosure?: RegExp | string;
  readonly form?: string;
  readonly heading: string;
  readonly path: string;
  readonly table?: string;
};

export const recommendationDecisionRoute = {
  disclosure: /Work orders \(1\)/,
  form: "Record planner decision for PKG-BASE-001",
  heading: "PKG-BASE-001",
  path: "/recommendations/60000000-0000-4000-8000-000000002000",
  table: "PKG-BASE-001 work orders"
} as const satisfies PlannerRouteAccessibilityFixture;

export const plannerRouteFixtures = [
  {
    heading: "Planner Workbench",
    path: "/"
  },
  {
    heading: "Recommendations",
    path: "/recommendations",
    table: "Package recommendation queue"
  },
  recommendationDecisionRoute,
  {
    heading: "Work-order backlog",
    path: "/work-order-backlog",
    table: "Planner work-order triage"
  },
  {
    heading: "Coordination exceptions",
    path: "/coordination-exceptions",
    table: "Planner work-order triage"
  },
  {
    heading: "Planning runs",
    path: "/planning-runs",
    table: "Planning run list"
  },
  {
    heading: "Planning run detail",
    path: "/planning-runs/50000000-0000-4000-8000-000000002000",
    table: "Planning run recommendation detail"
  },
  {
    heading: "Operations posture",
    path: "/operations-posture",
    table: "Operations posture signals"
  },
  {
    heading: "Scenario outcomes",
    path: "/scenario-outcomes",
    table: "Synthetic scenario outcomes"
  }
] as const satisfies readonly PlannerRouteAccessibilityFixture[];
