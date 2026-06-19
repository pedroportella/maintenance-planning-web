import type { GuidString, IsoDateTimeString } from "./contracts";

export type PlannerRuntimeMode = "mock" | "backend";

export type PlannerReadinessStatus = "ready" | "needs-review" | "blocked";

export type PlannerWorkOrderState = "ready" | "blocked" | "deferred";

export type PlannerRuntimeInfo = {
  readonly mode: PlannerRuntimeMode;
  readonly backendConfigured: boolean;
  readonly mockScenarioId?: string;
};

export type OperationsPostureState = "healthy" | "attention" | "stale" | "degraded";

export type OperationsFreshnessState = "fresh" | "missing" | "stale" | "unknown";

export type OperationsSignalView = {
  readonly label: string;
  readonly status: OperationsPostureState;
  readonly summary: string;
  readonly detail?: string | null;
  readonly checkedAtUtc?: IsoDateTimeString | null;
};

export type OperationsPostureView = {
  readonly databaseConfigured: boolean;
  readonly status: string;
  readonly checkedAtUtc: IsoDateTimeString;
  readonly freshness: OperationsFreshnessState;
  readonly latestImport?: LatestImportView | null;
  readonly signals: readonly OperationsSignalView[];
  readonly state: OperationsPostureState;
  readonly summary: string;
};

export type LatestImportView = {
  readonly importId: GuidString;
  readonly sourceSystem: string;
  readonly importKind: string;
  readonly status: string;
  readonly receivedCount: number;
  readonly acceptedCount: number;
  readonly rejectedCount: number;
  readonly ignoredDuplicateCount: number;
  readonly ignoredStaleCount: number;
  readonly receivedAtUtc: IsoDateTimeString;
  readonly completedAtUtc?: IsoDateTimeString | null;
};

export type SourceDataReadinessView = {
  readonly status: PlannerReadinessStatus;
  readonly summary: string;
  readonly readyCount: number;
  readonly needsReviewCount: number;
  readonly blockedCount: number;
  readonly databaseConfigured: boolean;
  readonly databaseReachable: boolean;
  readonly checkedAtUtc: IsoDateTimeString;
  readonly issueCode?: string | null;
  readonly latestImport?: LatestImportView | null;
};

export type PlannerRecommendationSet = {
  readonly planningRunId: GuidString;
  readonly runNumber: string;
  readonly status: string;
  readonly recommendations: readonly PlannerRecommendation[];
};

export type PlannerRecommendation = {
  readonly packageId: GuidString;
  readonly packageNumber: string;
  readonly title: string;
  readonly status: string;
  readonly score: number;
  readonly actionability: string;
  readonly estimatedHours: number;
  readonly plannedStartUtc?: IsoDateTimeString | null;
  readonly plannedEndUtc?: IsoDateTimeString | null;
  readonly explanation: RecommendationExplanationView;
  readonly sourceDataReadiness: ReadinessSummaryView;
  readonly blockers: readonly RecommendationBlockerView[];
  readonly workOrders: readonly WorkOrderBacklogItem[];
  readonly decisions: readonly PlannerDecisionRecord[];
};

export type RecommendationExplanationView = {
  readonly text: string;
  readonly score: number;
  readonly actionability: string;
  readonly readinessSummary: string;
  readonly blockerSummaries: readonly string[];
};

export type ReadinessSummaryView = {
  readonly status: PlannerReadinessStatus;
  readonly readyCount: number;
  readonly needsReviewCount: number;
  readonly blockedCount: number;
  readonly summary: string;
};

export type RecommendationBlockerView = {
  readonly code: string;
  readonly category: string;
  readonly severity: string;
  readonly summary: string;
  readonly workOrderNumbers: readonly string[];
};

export type WorkOrderBacklogView = {
  readonly generatedAtUtc: IsoDateTimeString;
  readonly counts: WorkOrderBacklogCounts;
  readonly items: readonly WorkOrderBacklogItem[];
};

export type WorkOrderBacklogCounts = {
  readonly ready: number;
  readonly blocked: number;
  readonly deferred: number;
  readonly total: number;
};

export type WorkOrderBacklogItem = {
  readonly id: GuidString;
  readonly sourceSystem: string;
  readonly sourceId: string;
  readonly workOrderNumber: string;
  readonly title: string;
  readonly workType: string;
  readonly priority: string;
  readonly lifecycleStatus: string;
  readonly readinessStatus: PlannerReadinessStatus;
  readonly plannerState: PlannerWorkOrderState;
  readonly readinessIssueCode?: string | null;
  readonly readinessIssueDetail?: string | null;
  readonly requiredStartUtc?: IsoDateTimeString | null;
  readonly dueAtUtc?: IsoDateTimeString | null;
  readonly scheduledStartUtc?: IsoDateTimeString | null;
  readonly estimatedHours?: number | null;
  readonly assetNumber?: string | null;
  readonly assetName?: string | null;
  readonly functionalLocationCode?: string | null;
  readonly functionalLocationName?: string | null;
  readonly packageId: GuidString;
  readonly packageNumber: string;
  readonly packageTitle: string;
  readonly recommendationScore: number;
  readonly blockerCodes: readonly string[];
  readonly latestDecision?: PlannerDecisionRecord | null;
};

export type PlannerDecisionRecord = {
  readonly id: GuidString;
  readonly packageId: GuidString;
  readonly workOrderId?: GuidString | null;
  readonly decision: string;
  readonly reasonCode: string;
  readonly notes?: string | null;
  readonly decidedAtUtc: IsoDateTimeString;
  readonly decidedBy: string;
};

export type PlannerDecisionCommand = {
  readonly packageId: GuidString;
  readonly decision: string;
  readonly reasonCode: string;
  readonly notes?: string | null;
  readonly decidedBy?: string | null;
  readonly workOrderIds?: readonly GuidString[];
};

export type PlannerDecisionResultView = {
  readonly packageId: GuidString;
  readonly packageNumber: string;
  readonly packageStatus: string;
  readonly decisions: readonly PlannerDecisionRecord[];
};

export type ScenarioOutcomeState = "healthy" | "stale" | "degraded";

export type ScenarioOutcomeView = {
  readonly scenarioId: string;
  readonly label: string;
  readonly status: ScenarioOutcomeState;
  readonly statusText: string;
  readonly summary: string;
  readonly checkedAtUtc: IsoDateTimeString;
  readonly planningRunId: GuidString;
  readonly runNumber: string;
  readonly packageCount: number;
  readonly readyPackageCount: number;
  readonly blockedPackageCount: number;
  readonly deferredDecisionCount: number;
  readonly latestImport?: LatestImportView | null;
  readonly signals: readonly OperationsSignalView[];
};

export type ScenarioOutcomeSummaryView = {
  readonly generatedAtUtc: IsoDateTimeString;
  readonly latest: ScenarioOutcomeView;
  readonly outcomes: readonly ScenarioOutcomeView[];
};

export type RecommendationQuery = {
  readonly planningRunId?: GuidString;
  readonly createRunIfMissing?: boolean;
  readonly horizon?: string;
  readonly horizonStartUtc?: IsoDateTimeString | null;
  readonly horizonEndUtc?: IsoDateTimeString | null;
  readonly requestedBy?: string | null;
};

export type PlannerServices = {
  readonly getRuntimeInfo: () => PlannerRuntimeInfo;
  readonly getOperationsPosture: () => Promise<OperationsPostureView>;
  readonly getSourceDataReadiness: () => Promise<SourceDataReadinessView>;
  readonly getScenarioOutcomeSummary: () => Promise<ScenarioOutcomeSummaryView>;
  readonly getRecommendationSet: (query?: RecommendationQuery) => Promise<PlannerRecommendationSet>;
  readonly getWorkOrderBacklog: (query?: RecommendationQuery) => Promise<WorkOrderBacklogView>;
  readonly recordPlannerDecision: (
    command: PlannerDecisionCommand
  ) => Promise<PlannerDecisionResultView>;
};
