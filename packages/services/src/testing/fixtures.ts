import type {
  MigrationReadinessReport,
  OperationsPostureReport,
  PackageDecisionResult,
  PackageRecommendationResult,
  PlanningRecommendationsResult,
  PlannerDecisionResult,
  RecommendationWorkOrderResult
} from "../contracts";

export const stableFixtureTimestamp = "2026-01-15T08:00:00.000Z";

export const mockScenarioIds = [
  "baseline-week",
  "event-window-conflict",
  "parts-delay-replan"
] as const;

export type MockScenarioId = (typeof mockScenarioIds)[number];

export type MockScenarioFixture = {
  readonly scenarioId: MockScenarioId;
  readonly operationsPosture: OperationsPostureReport;
  readonly migrationReadiness: MigrationReadinessReport;
  readonly recommendations: PlanningRecommendationsResult;
};

export function isMockScenarioId(value: string): value is MockScenarioId {
  return mockScenarioIds.includes(value as MockScenarioId);
}

export function getMockScenarioFixture(scenarioId: MockScenarioId): MockScenarioFixture {
  return mockScenarioFixtures[scenarioId];
}

export function mockPackageDecisionResult(input: {
  readonly packageId: string;
  readonly packageNumber?: string;
  readonly decision: string;
  readonly reasonCode: string;
  readonly notes?: string | null;
  readonly decidedBy?: string | null;
  readonly workOrderIds: readonly string[];
}): PackageDecisionResult {
  const workOrderIds = input.workOrderIds.length > 0 ? input.workOrderIds : [null];

  return {
    packageId: input.packageId,
    packageNumber: input.packageNumber ?? "PKG-MOCK-DECISION",
    packageStatus: packageStatusForDecision(input.decision),
    decisions: workOrderIds.map((workOrderId, index) => ({
      id: `80000000-0000-4000-8000-00000000999${index}`,
      packageId: input.packageId,
      workOrderId,
      decision: input.decision,
      reasonCode: input.reasonCode,
      notes: input.notes,
      decidedAtUtc: stableFixtureTimestamp,
      decidedBy: input.decidedBy ?? "planner-workbench"
    }))
  };
}

function packageStatusForDecision(decision: string) {
  if (decision === "Deferred") return "Deferred";
  if (decision === "Rejected") return "Rejected";

  return "PlannerReviewed";
}

const baselineRecommendation = recommendation({
  packageId: "60000000-0000-4000-8000-000000002000",
  packageNumber: "PKG-BASE-001",
  title: "Baseline weekly work package",
  score: 87,
  actionability: "Ready",
  explanation: "Ready work can be grouped inside the current planning horizon.",
  readiness: {
    overallStatus: "Ready",
    readyCount: 1,
    needsReviewCount: 0,
    blockedCount: 0,
    summary: "One work order is ready for planner review."
  },
  blockers: [],
  workOrders: [
    workOrder({
      id: "30000000-0000-4000-8000-000000002000",
      sourceId: "WO-2000",
      title: "Replace pump seals",
      readiness: "Ready",
      estimatedHours: 8,
      requiredStartUtc: "2026-01-15T10:00:00.000Z",
      dueAtUtc: "2026-01-17T10:00:00.000Z",
      scheduledStartUtc: "2026-01-15T13:00:00.000Z",
      assetNumber: "ASSET-2000",
      assetName: "Synthetic pump set",
      functionalLocationCode: "FL-2000",
      functionalLocationName: "Synthetic process area"
    })
  ],
  decisions: []
});

const baselineBlockedRecommendation = recommendation({
  packageId: "60000000-0000-4000-8000-000000002001",
  packageNumber: "PKG-BASE-REVIEW",
  title: "Baseline blocked work review",
  score: 31,
  actionability: "Blocked",
  status: "Blocked",
  explanation: "The work order is accepted for review but missing effort detail.",
  readiness: {
    overallStatus: "Blocked",
    readyCount: 0,
    needsReviewCount: 0,
    blockedCount: 1,
    summary: "One work order is blocked by incomplete source data."
  },
  blockers: [
    {
      code: "missing-estimate",
      category: "source-data",
      severity: "warning",
      summary: "Estimated effort is required before packaging.",
      workOrderNumbers: ["WO-2001"]
    }
  ],
  workOrders: [
    workOrder({
      id: "30000000-0000-4000-8000-000000002001",
      sourceId: "WO-2001",
      title: "Inspect transfer line",
      readiness: "Blocked",
      readinessIssueCode: "missing-estimate",
      readinessIssueDetail: "Estimated effort is not present in the source event.",
      estimatedHours: null,
      dueAtUtc: "2026-01-18T10:00:00.000Z",
      assetNumber: "ASSET-2001",
      assetName: "Synthetic transfer line",
      functionalLocationCode: "FL-2001",
      functionalLocationName: "Synthetic line corridor"
    })
  ],
  decisions: []
});

const eventWindowReadyRecommendation = recommendation({
  packageId: "60000000-0000-4000-8000-000000002100",
  packageNumber: "PKG-EVENT-001",
  title: "Access-window ready package",
  score: 82,
  actionability: "Ready",
  explanation: "Ready work fits the synthetic event window without a planning conflict.",
  readiness: {
    overallStatus: "Ready",
    readyCount: 1,
    needsReviewCount: 0,
    blockedCount: 0,
    summary: "One work order is ready inside the event window."
  },
  blockers: [],
  workOrders: [
    workOrder({
      id: "30000000-0000-4000-8000-000000002100",
      sourceId: "WO-2100",
      title: "Service isolation valve",
      readiness: "Ready",
      estimatedHours: 6,
      requiredStartUtc: "2026-02-02T09:00:00.000Z",
      dueAtUtc: "2026-02-04T09:00:00.000Z",
      scheduledStartUtc: "2026-02-02T11:00:00.000Z",
      assetNumber: "ASSET-2100",
      assetName: "Synthetic valve",
      functionalLocationCode: "FL-2100",
      functionalLocationName: "Synthetic access area"
    })
  ],
  decisions: []
});

const eventWindowDeferredRecommendation = recommendation({
  packageId: "60000000-0000-4000-8000-000000002101",
  packageNumber: "PKG-EVENT-REPLAN",
  title: "Deferred access-window package",
  score: 58,
  actionability: "NeedsPlannerReview",
  status: "Deferred",
  explanation: "A planner decision deferred this ready work because the access window moved.",
  readiness: {
    overallStatus: "Ready",
    readyCount: 1,
    needsReviewCount: 0,
    blockedCount: 0,
    summary: "The source data is ready, but the package decision is deferred."
  },
  blockers: [],
  workOrders: [
    workOrder({
      id: "30000000-0000-4000-8000-000000002101",
      sourceId: "WO-2101",
      title: "Calibrate flow transmitter",
      readiness: "Ready",
      estimatedHours: 4,
      dueAtUtc: "2026-02-05T09:00:00.000Z",
      assetNumber: "ASSET-2101",
      assetName: "Synthetic transmitter",
      functionalLocationCode: "FL-2101",
      functionalLocationName: "Synthetic instrument bay"
    })
  ],
  decisions: [
    {
      id: "80000000-0000-4000-8000-000000002101",
      packageId: "60000000-0000-4000-8000-000000002101",
      workOrderId: "30000000-0000-4000-8000-000000002101",
      decision: "Deferred",
      reasonCode: "access-window-moved",
      notes: "Synthetic review deferred until the next coordination window.",
      decidedAtUtc: "2026-02-02T08:45:00.000Z",
      decidedBy: "planner-workbench"
    }
  ]
});

const partsDelayDeferredRecommendation = recommendation({
  packageId: "60000000-0000-4000-8000-000000002200",
  packageNumber: "PKG-PARTS-REPLAN",
  title: "Parts-delay replan package",
  score: 64,
  actionability: "NeedsPlannerReview",
  status: "Deferred",
  explanation: "Parts availability changed after import, so the package needs planner review.",
  readiness: {
    overallStatus: "Ready",
    readyCount: 1,
    needsReviewCount: 0,
    blockedCount: 0,
    summary: "The latest source event is ready, but a deferral decision remains visible."
  },
  blockers: [],
  workOrders: [
    workOrder({
      id: "30000000-0000-4000-8000-000000002200",
      sourceId: "WO-2200",
      title: "Replace conveyor sensor",
      readiness: "Ready",
      estimatedHours: 5,
      dueAtUtc: "2026-03-12T09:00:00.000Z",
      assetNumber: "ASSET-2200",
      assetName: "Synthetic sensor",
      functionalLocationCode: "FL-2200",
      functionalLocationName: "Synthetic materials route"
    })
  ],
  decisions: [
    {
      id: "80000000-0000-4000-8000-000000002200",
      packageId: "60000000-0000-4000-8000-000000002200",
      workOrderId: "30000000-0000-4000-8000-000000002200",
      decision: "Deferred",
      reasonCode: "parts-delay",
      notes: "Synthetic parts signal requested a later planning review.",
      decidedAtUtc: "2026-03-10T08:50:00.000Z",
      decidedBy: "planner-workbench"
    }
  ]
});

const partsDelayBlockedRecommendation = recommendation({
  packageId: "60000000-0000-4000-8000-000000002201",
  packageNumber: "PKG-PARTS-BLOCKED",
  title: "Source-data blocked planning context",
  score: 27,
  actionability: "Blocked",
  status: "Blocked",
  explanation: "Two work orders need source-data review before a package can be accepted.",
  readiness: {
    overallStatus: "Blocked",
    readyCount: 0,
    needsReviewCount: 0,
    blockedCount: 2,
    summary: "Source equipment and planning context are incomplete."
  },
  blockers: [
    {
      code: "missing-equipment",
      category: "source-data",
      severity: "warning",
      summary: "Equipment source id is required before packaging.",
      workOrderNumbers: ["WO-2201"]
    },
    {
      code: "missing-planning-context",
      category: "source-data",
      severity: "warning",
      summary: "Priority and work-center context are required before packaging.",
      workOrderNumbers: ["WO-2202"]
    }
  ],
  workOrders: [
    workOrder({
      id: "30000000-0000-4000-8000-000000002201",
      sourceId: "WO-2201",
      title: "Inspect synthetic drive",
      readiness: "Blocked",
      readinessIssueCode: "missing-equipment",
      readinessIssueDetail: "Equipment source id is not present in the event.",
      estimatedHours: 3,
      dueAtUtc: "2026-03-13T09:00:00.000Z",
      functionalLocationCode: "FL-2201",
      functionalLocationName: "Synthetic drive area"
    }),
    workOrder({
      id: "30000000-0000-4000-8000-000000002202",
      sourceId: "WO-2202",
      title: "Review synthetic belt alignment",
      readiness: "Blocked",
      readinessIssueCode: "missing-planning-context",
      readinessIssueDetail: "Priority and work-center context are not present in the source extract.",
      estimatedHours: 2,
      dueAtUtc: "2026-03-13T11:00:00.000Z",
      assetNumber: "ASSET-2202",
      assetName: "Synthetic belt",
      functionalLocationCode: "FL-2202",
      functionalLocationName: "Synthetic alignment area"
    })
  ],
  decisions: []
});

const mockScenarioFixtures: Record<MockScenarioId, MockScenarioFixture> = {
  "baseline-week": scenarioFixture({
    scenarioId: "baseline-week",
    planningRunId: "50000000-0000-4000-8000-000000002000",
    runNumber: "RUN-BASE-2026-01-15",
    recommendations: [baselineRecommendation, baselineBlockedRecommendation],
    latestImportCounts: {
      receivedCount: 10,
      acceptedCount: 7,
      rejectedCount: 1,
      ignoredDuplicateCount: 1,
      ignoredStaleCount: 1
    }
  }),
  "event-window-conflict": scenarioFixture({
    scenarioId: "event-window-conflict",
    planningRunId: "50000000-0000-4000-8000-000000002100",
    runNumber: "RUN-EVENT-2026-02-02",
    recommendations: [eventWindowReadyRecommendation, eventWindowDeferredRecommendation],
    latestImportCounts: {
      receivedCount: 8,
      acceptedCount: 6,
      rejectedCount: 0,
      ignoredDuplicateCount: 1,
      ignoredStaleCount: 1
    }
  }),
  "parts-delay-replan": scenarioFixture({
    scenarioId: "parts-delay-replan",
    planningRunId: "50000000-0000-4000-8000-000000002200",
    runNumber: "RUN-PARTS-2026-03-10",
    recommendations: [partsDelayDeferredRecommendation, partsDelayBlockedRecommendation],
    latestImportCounts: {
      receivedCount: 10,
      acceptedCount: 8,
      rejectedCount: 1,
      ignoredDuplicateCount: 1,
      ignoredStaleCount: 0
    }
  })
};

function scenarioFixture(input: {
  readonly scenarioId: MockScenarioId;
  readonly planningRunId: string;
  readonly runNumber: string;
  readonly recommendations: readonly PackageRecommendationResult[];
  readonly latestImportCounts: {
    readonly receivedCount: number;
    readonly acceptedCount: number;
    readonly rejectedCount: number;
    readonly ignoredDuplicateCount: number;
    readonly ignoredStaleCount: number;
  };
}): MockScenarioFixture {
  return {
    scenarioId: input.scenarioId,
    operationsPosture: {
      databaseConfigured: true,
      status: "ready",
      latestImport: {
        importId: `40000000-0000-4000-8000-${input.planningRunId.slice(-12)}`,
        sourceSystem: "synthetic-source",
        importKind: "maintenance-events",
        status: "completed",
        receivedAtUtc: stableFixtureTimestamp,
        completedAtUtc: stableFixtureTimestamp,
        ...input.latestImportCounts
      },
      checkedAtUtc: stableFixtureTimestamp
    },
    migrationReadiness: {
      databaseConfigured: true,
      databaseReachable: true,
      isReady: true,
      status: "ready",
      appliedMigrationCount: 2,
      pendingMigrationCount: 0,
      pendingMigrations: [],
      latestAppliedMigration: "synthetic-mock-fixture",
      issueCode: null,
      checkedAtUtc: stableFixtureTimestamp
    },
    recommendations: {
      planningRunId: input.planningRunId,
      runNumber: input.runNumber,
      status: "Completed",
      recommendations: input.recommendations
    }
  };
}

function recommendation(input: {
  readonly packageId: string;
  readonly packageNumber: string;
  readonly title: string;
  readonly score: number;
  readonly actionability: string;
  readonly explanation: string;
  readonly readiness: PackageRecommendationResult["sourceDataReadiness"];
  readonly blockers: PackageRecommendationResult["blockers"];
  readonly workOrders: readonly RecommendationWorkOrderResult[];
  readonly decisions: readonly PlannerDecisionResult[];
  readonly status?: string;
}): PackageRecommendationResult {
  return {
    packageId: input.packageId,
    packageNumber: input.packageNumber,
    title: input.title,
    status: input.status ?? "Recommended",
    score: input.score,
    actionability: input.actionability,
    estimatedHours: input.workOrders.reduce((total, item) => total + (item.estimatedHours ?? 0), 0),
    plannedStartUtc: input.workOrders[0]?.scheduledStartUtc ?? null,
    plannedEndUtc: input.workOrders[0]?.dueAtUtc ?? null,
    explanation: input.explanation,
    sourceDataReadiness: input.readiness,
    blockers: input.blockers,
    workOrders: input.workOrders,
    decisions: input.decisions
  };
}

function workOrder(input: {
  readonly id: string;
  readonly sourceId: string;
  readonly title: string;
  readonly readiness: string;
  readonly estimatedHours?: number | null;
  readonly requiredStartUtc?: string | null;
  readonly dueAtUtc?: string | null;
  readonly scheduledStartUtc?: string | null;
  readonly readinessIssueCode?: string | null;
  readonly readinessIssueDetail?: string | null;
  readonly assetNumber?: string | null;
  readonly assetName?: string | null;
  readonly functionalLocationCode?: string | null;
  readonly functionalLocationName?: string | null;
}): RecommendationWorkOrderResult {
  return {
    id: input.id,
    sourceSystem: "synthetic-source",
    sourceId: input.sourceId,
    workOrderNumber: input.sourceId,
    title: input.title,
    workType: "preventive",
    priority: "medium",
    status: input.readiness === "Ready" ? "ReadyForPlanning" : "Imported",
    readiness: input.readiness,
    readinessIssueCode: input.readinessIssueCode,
    readinessIssueDetail: input.readinessIssueDetail,
    requiredStartUtc: input.requiredStartUtc ?? null,
    dueAtUtc: input.dueAtUtc ?? null,
    scheduledStartUtc: input.scheduledStartUtc ?? null,
    estimatedHours: input.estimatedHours,
    assetNumber: input.assetNumber,
    assetName: input.assetName,
    functionalLocationCode: input.functionalLocationCode,
    functionalLocationName: input.functionalLocationName
  };
}
