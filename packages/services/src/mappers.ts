import type {
  MigrationReadinessReport,
  OperationsPostureReport,
  PackageDecisionResult,
  PackageRecommendationResult,
  PlannerDecisionResult,
  PlanningRecommendationsResult,
  RecommendationWorkOrderResult,
  SourceDataReadinessSummary
} from "./contracts";
import type {
  LatestImportView,
  OperationsPostureView,
  PlannerDecisionRecord,
  PlannerDecisionResultView,
  PlannerReadinessStatus,
  PlannerRecommendation,
  PlannerRecommendationSet,
  PlannerWorkOrderState,
  ReadinessSummaryView,
  SourceDataReadinessView,
  WorkOrderBacklogItem,
  WorkOrderBacklogView
} from "./models";

export function mapOperationsPosture(report: OperationsPostureReport): OperationsPostureView {
  return {
    databaseConfigured: report.databaseConfigured,
    status: report.status,
    checkedAtUtc: report.checkedAtUtc,
    latestImport: report.latestImport ? mapLatestImport(report.latestImport) : null
  };
}

export function mapSourceDataReadiness(
  migration: MigrationReadinessReport,
  posture: OperationsPostureView
): SourceDataReadinessView {
  return {
    status: migration.isReady ? "ready" : "blocked",
    summary: migration.isReady
      ? "Source-data persistence is reachable for review."
      : "Source-data persistence needs attention before backend review.",
    readyCount: migration.isReady ? 1 : 0,
    needsReviewCount: migration.isReady ? 0 : 1,
    blockedCount: migration.isReady ? 0 : 1,
    databaseConfigured: migration.databaseConfigured,
    databaseReachable: migration.databaseReachable,
    checkedAtUtc: migration.checkedAtUtc,
    issueCode: migration.issueCode,
    latestImport: posture.latestImport
  };
}

export function mapPlanningRecommendations(
  result: PlanningRecommendationsResult
): PlannerRecommendationSet {
  return {
    planningRunId: result.planningRunId,
    runNumber: result.runNumber,
    status: result.status,
    recommendations: result.recommendations.map(mapRecommendation)
  };
}

export function mapWorkOrderBacklog(
  recommendations: PlannerRecommendationSet,
  generatedAtUtc: string
): WorkOrderBacklogView {
  const items = recommendations.recommendations.flatMap((recommendation) => recommendation.workOrders);

  return {
    generatedAtUtc,
    counts: {
      ready: items.filter((item) => item.plannerState === "ready").length,
      blocked: items.filter((item) => item.plannerState === "blocked").length,
      deferred: items.filter((item) => item.plannerState === "deferred").length,
      total: items.length
    },
    items
  };
}

export function mapPlannerDecisionResult(result: PackageDecisionResult): PlannerDecisionResultView {
  return {
    packageId: result.packageId,
    packageNumber: result.packageNumber,
    packageStatus: result.packageStatus,
    decisions: result.decisions.map(mapDecision)
  };
}

function mapRecommendation(recommendation: PackageRecommendationResult): PlannerRecommendation {
  const decisions = recommendation.decisions.map(mapDecision);
  const readiness = mapReadinessSummary(recommendation.sourceDataReadiness);

  return {
    packageId: recommendation.packageId,
    packageNumber: recommendation.packageNumber,
    title: recommendation.title,
    status: recommendation.status,
    score: recommendation.score,
    actionability: recommendation.actionability,
    estimatedHours: recommendation.estimatedHours,
    plannedStartUtc: recommendation.plannedStartUtc,
    plannedEndUtc: recommendation.plannedEndUtc,
    explanation: {
      text: recommendation.explanation,
      score: recommendation.score,
      actionability: recommendation.actionability,
      readinessSummary: recommendation.sourceDataReadiness.summary,
      blockerSummaries: recommendation.blockers.map((blocker) => blocker.summary)
    },
    sourceDataReadiness: readiness,
    blockers: recommendation.blockers.map((blocker) => ({
      code: blocker.code,
      category: blocker.category,
      severity: blocker.severity,
      summary: blocker.summary,
      workOrderNumbers: blocker.workOrderNumbers
    })),
    workOrders: recommendation.workOrders.map((workOrder) =>
      mapWorkOrder(workOrder, recommendation, decisions)
    ),
    decisions
  };
}

function mapWorkOrder(
  workOrder: RecommendationWorkOrderResult,
  recommendation: PackageRecommendationResult,
  decisions: readonly PlannerDecisionRecord[]
): WorkOrderBacklogItem {
  const latestDecision = findLatestDecision(decisions, workOrder.id);

  return {
    id: workOrder.id,
    sourceSystem: workOrder.sourceSystem,
    sourceId: workOrder.sourceId,
    workOrderNumber: workOrder.workOrderNumber,
    title: workOrder.title,
    workType: workOrder.workType,
    priority: workOrder.priority,
    lifecycleStatus: workOrder.status,
    readinessStatus: normalizeReadiness(workOrder.readiness),
    plannerState: toPlannerState(workOrder, latestDecision),
    readinessIssueCode: workOrder.readinessIssueCode,
    readinessIssueDetail: workOrder.readinessIssueDetail,
    requiredStartUtc: workOrder.requiredStartUtc,
    dueAtUtc: workOrder.dueAtUtc,
    scheduledStartUtc: workOrder.scheduledStartUtc,
    estimatedHours: workOrder.estimatedHours,
    assetNumber: workOrder.assetNumber,
    assetName: workOrder.assetName,
    functionalLocationCode: workOrder.functionalLocationCode,
    functionalLocationName: workOrder.functionalLocationName,
    packageId: recommendation.packageId,
    packageNumber: recommendation.packageNumber,
    packageTitle: recommendation.title,
    recommendationScore: recommendation.score,
    blockerCodes: recommendation.blockers
      .filter((blocker) => blocker.workOrderNumbers.includes(workOrder.workOrderNumber))
      .map((blocker) => blocker.code),
    latestDecision
  };
}

function mapReadinessSummary(summary: SourceDataReadinessSummary): ReadinessSummaryView {
  return {
    status: normalizeReadiness(summary.overallStatus),
    readyCount: summary.readyCount,
    needsReviewCount: summary.needsReviewCount,
    blockedCount: summary.blockedCount,
    summary: summary.summary
  };
}

function mapDecision(decision: PlannerDecisionResult): PlannerDecisionRecord {
  return {
    id: decision.id,
    packageId: decision.packageId,
    workOrderId: decision.workOrderId,
    decision: decision.decision,
    reasonCode: decision.reasonCode,
    notes: decision.notes,
    decidedAtUtc: decision.decidedAtUtc,
    decidedBy: decision.decidedBy
  };
}

function mapLatestImport(importReport: LatestImportView): LatestImportView {
  return {
    importId: importReport.importId,
    sourceSystem: importReport.sourceSystem,
    importKind: importReport.importKind,
    status: importReport.status,
    receivedCount: importReport.receivedCount,
    acceptedCount: importReport.acceptedCount,
    rejectedCount: importReport.rejectedCount,
    ignoredDuplicateCount: importReport.ignoredDuplicateCount,
    ignoredStaleCount: importReport.ignoredStaleCount,
    receivedAtUtc: importReport.receivedAtUtc,
    completedAtUtc: importReport.completedAtUtc
  };
}

function normalizeReadiness(value: string): PlannerReadinessStatus {
  const normalized = value.replace(/[\s_-]/g, "").toLowerCase();
  if (normalized === "ready") return "ready";
  if (normalized === "needsreview") return "needs-review";
  return "blocked";
}

function toPlannerState(
  workOrder: RecommendationWorkOrderResult,
  latestDecision?: PlannerDecisionRecord | null
): PlannerWorkOrderState {
  if (latestDecision?.decision.toLowerCase() === "deferred") {
    return "deferred";
  }

  return normalizeReadiness(workOrder.readiness) === "blocked" ? "blocked" : "ready";
}

function findLatestDecision(
  decisions: readonly PlannerDecisionRecord[],
  workOrderId: string
): PlannerDecisionRecord | null {
  const relevantDecisions = decisions
    .filter((decision) => !decision.workOrderId || decision.workOrderId === workOrderId)
    .sort((left, right) => right.decidedAtUtc.localeCompare(left.decidedAtUtc));

  return relevantDecisions[0] ?? null;
}
