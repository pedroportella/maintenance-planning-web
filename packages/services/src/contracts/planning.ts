import type { GuidString, IsoDateTimeString } from "./common";

export type CreatePlanningRunRequest = {
  readonly horizon?: string;
  readonly horizonStartUtc?: IsoDateTimeString | null;
  readonly horizonEndUtc?: IsoDateTimeString | null;
  readonly requestedBy?: string | null;
  readonly idempotencyKey: string;
};

export type RecordPackageDecisionRequest = {
  readonly decision: string;
  readonly reasonCode: string;
  readonly notes?: string | null;
  readonly decidedBy?: string | null;
  readonly workOrderIds: readonly GuidString[];
};

export type PlanningRunResult = {
  readonly id: GuidString;
  readonly runNumber: string;
  readonly status: string;
  readonly horizon: string;
  readonly horizonStartUtc: IsoDateTimeString;
  readonly horizonEndUtc: IsoDateTimeString;
  readonly startedAtUtc: IsoDateTimeString;
  readonly completedAtUtc?: IsoDateTimeString | null;
  readonly requestedBy: string;
  readonly recommendationCount: number;
  readonly readyRecommendationCount: number;
  readonly blockedRecommendationCount: number;
};

export type PlanningRecommendationsResult = {
  readonly planningRunId: GuidString;
  readonly runNumber: string;
  readonly status: string;
  readonly recommendations: readonly PackageRecommendationResult[];
};

export type PackageRecommendationResult = {
  readonly packageId: GuidString;
  readonly packageNumber: string;
  readonly title: string;
  readonly status: string;
  readonly score: number;
  readonly actionability: string;
  readonly estimatedHours: number;
  readonly plannedStartUtc?: IsoDateTimeString | null;
  readonly plannedEndUtc?: IsoDateTimeString | null;
  readonly explanation: string;
  readonly sourceDataReadiness: SourceDataReadinessSummary;
  readonly blockers: readonly RecommendationBlocker[];
  readonly workOrders: readonly RecommendationWorkOrderResult[];
  readonly decisions: readonly PlannerDecisionResult[];
};

export type SourceDataReadinessSummary = {
  readonly overallStatus: string;
  readonly readyCount: number;
  readonly needsReviewCount: number;
  readonly blockedCount: number;
  readonly summary: string;
};

export type RecommendationBlocker = {
  readonly code: string;
  readonly category: string;
  readonly severity: string;
  readonly summary: string;
  readonly workOrderNumbers: readonly string[];
};

export type RecommendationWorkOrderResult = {
  readonly id: GuidString;
  readonly sourceSystem: string;
  readonly sourceId: string;
  readonly workOrderNumber: string;
  readonly title: string;
  readonly workType: string;
  readonly priority: string;
  readonly status: string;
  readonly readiness: string;
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
};

export type PlannerDecisionResult = {
  readonly id: GuidString;
  readonly packageId: GuidString;
  readonly workOrderId?: GuidString | null;
  readonly decision: string;
  readonly reasonCode: string;
  readonly notes?: string | null;
  readonly decidedAtUtc: IsoDateTimeString;
  readonly decidedBy: string;
};

export type PackageDecisionResult = {
  readonly packageId: GuidString;
  readonly packageNumber: string;
  readonly packageStatus: string;
  readonly decisions: readonly PlannerDecisionResult[];
};

export type PlanningProblem = {
  readonly statusCode: number;
  readonly title: string;
  readonly detail: string;
  readonly code: string;
  readonly errors?: Readonly<Record<string, readonly string[]>> | null;
};
