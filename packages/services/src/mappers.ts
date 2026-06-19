import type {
  LatestImportFreshness,
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
  OperationsFreshnessState,
  OperationsPostureView,
  OperationsSignalView,
  PlannerDecisionRecord,
  PlannerDecisionResultView,
  PlannerReadinessStatus,
  PlannerRecommendation,
  PlannerRecommendationSet,
  PlannerWorkOrderState,
  ReadinessSummaryView,
  ScenarioOutcomeState,
  ScenarioOutcomeSummaryView,
  ScenarioOutcomeView,
  SourceDataReadinessView,
  WorkOrderBacklogItem,
  WorkOrderBacklogView
} from "./models";

export function mapOperationsPosture(report: OperationsPostureReport): OperationsPostureView {
  const latestImport = report.latestImport ? mapLatestImport(report.latestImport) : null;
  const state = deriveOperationsPostureState(report.status, report.databaseConfigured, latestImport);
  const freshness = deriveFreshnessState(latestImport);

  return {
    databaseConfigured: report.databaseConfigured,
    status: report.status,
    checkedAtUtc: report.checkedAtUtc,
    freshness,
    latestImport,
    signals: buildOperationsSignals(report.status, report.databaseConfigured, latestImport, report.checkedAtUtc),
    state,
    summary: summarizeOperationsPosture(state, freshness, latestImport)
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

export function mapScenarioOutcome(input: {
  readonly scenarioId: string;
  readonly label?: string;
  readonly operationsPosture: OperationsPostureReport;
  readonly recommendations: PlanningRecommendationsResult;
}): ScenarioOutcomeView {
  const posture = mapOperationsPosture(input.operationsPosture);
  const recommendations = mapPlanningRecommendations(input.recommendations);
  const readyPackageCount = recommendations.recommendations.filter(isReadyRecommendation).length;
  const blockedPackageCount = recommendations.recommendations.filter(isBlockedRecommendation).length;
  const deferredDecisionCount = recommendations.recommendations.filter(hasDeferredDecision).length;
  const status = deriveScenarioOutcomeState(posture);

  return {
    scenarioId: input.scenarioId,
    label: input.label ?? humanizeScenarioId(input.scenarioId),
    status,
    statusText: scenarioStatusText(status),
    summary: summarizeScenarioOutcome(status, posture),
    checkedAtUtc: posture.checkedAtUtc,
    planningRunId: recommendations.planningRunId,
    runNumber: recommendations.runNumber,
    packageCount: recommendations.recommendations.length,
    readyPackageCount,
    blockedPackageCount,
    deferredDecisionCount,
    latestImport: posture.latestImport,
    signals: [
      ...posture.signals,
      {
        label: "Planning run",
        status: blockedPackageCount > 0 || deferredDecisionCount > 0 ? "attention" : "healthy",
        summary: `${recommendations.runNumber} returned ${recommendations.recommendations.length} package groups for planner review.`,
        detail: `${readyPackageCount} ready, ${blockedPackageCount} blocked, ${deferredDecisionCount} deferred decision record.`,
        checkedAtUtc: posture.checkedAtUtc
      }
    ]
  };
}

export function mapScenarioOutcomeSummary(
  outcomes: readonly ScenarioOutcomeView[],
  latestScenarioId: string,
  generatedAtUtc: string
): ScenarioOutcomeSummaryView {
  const latest = outcomes.find((outcome) => outcome.scenarioId === latestScenarioId) ?? outcomes[0];

  if (!latest) {
    throw new Error("At least one scenario outcome is required.");
  }

  return {
    generatedAtUtc,
    latest,
    outcomes
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

function mapLatestImport(importReport: LatestImportFreshness | LatestImportView): LatestImportView {
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

function buildOperationsSignals(
  status: string,
  databaseConfigured: boolean,
  latestImport: LatestImportView | null,
  checkedAtUtc: string
): readonly OperationsSignalView[] {
  return [
    {
      label: "Review store",
      status: databaseConfigured ? statusToneFromText(status) : "attention",
      summary: databaseConfigured
        ? `Planner review store reported ${status}.`
        : "Planner review store configuration is incomplete.",
      checkedAtUtc
    },
    latestImport
      ? {
          label: "Latest import",
          status: importSignalState(latestImport),
          summary: `${latestImport.acceptedCount} accepted from ${latestImport.receivedCount} received synthetic records.`,
          detail: `${latestImport.rejectedCount} rejected, ${latestImport.ignoredDuplicateCount} duplicate and ${latestImport.ignoredStaleCount} stale records stayed visible for review.`,
          checkedAtUtc: latestImport.completedAtUtc ?? latestImport.receivedAtUtc
        }
      : {
          label: "Latest import",
          status: "attention",
          summary: "No synthetic import summary is available yet.",
          checkedAtUtc
        },
    {
      label: "Freshness",
      status: freshnessSignalState(latestImport),
      summary: freshnessSummary(latestImport),
      checkedAtUtc: latestImport?.completedAtUtc ?? latestImport?.receivedAtUtc ?? checkedAtUtc
    }
  ];
}

function deriveOperationsPostureState(
  status: string,
  databaseConfigured: boolean,
  latestImport: LatestImportView | null
) {
  if (!databaseConfigured || statusIsDegraded(status) || latestImport?.rejectedCount) {
    return "degraded";
  }

  if (!latestImport) {
    return "attention";
  }

  if (latestImport.ignoredStaleCount > 0) {
    return "stale";
  }

  return "healthy";
}

function deriveFreshnessState(latestImport: LatestImportView | null): OperationsFreshnessState {
  if (!latestImport) return "missing";
  if (statusIsDegraded(latestImport.status)) return "unknown";
  if (latestImport.ignoredStaleCount > 0) return "stale";

  return "fresh";
}

function summarizeOperationsPosture(
  state: ReturnType<typeof deriveOperationsPostureState>,
  freshness: OperationsFreshnessState,
  latestImport: LatestImportView | null
) {
  if (state === "degraded") {
    return "Operations evidence needs attention before relying on this review state.";
  }

  if (state === "stale" || freshness === "stale") {
    return "Latest synthetic import includes stale rows that stayed visible for planner review.";
  }

  if (!latestImport) {
    return "No synthetic import has been reported for this review state.";
  }

  return "Operations evidence is available for the current synthetic review state.";
}

function deriveScenarioOutcomeState(posture: OperationsPostureView): ScenarioOutcomeState {
  if (posture.state === "degraded" || posture.state === "attention") return "degraded";
  if (posture.state === "stale") return "stale";

  return "healthy";
}

function summarizeScenarioOutcome(status: ScenarioOutcomeState, posture: OperationsPostureView) {
  if (status === "degraded") {
    return "The synthetic scenario completed with operations evidence that needs reviewer attention.";
  }

  if (status === "stale") {
    return "The synthetic scenario completed while stale source rows stayed visible for review.";
  }

  return posture.summary;
}

function scenarioStatusText(status: ScenarioOutcomeState) {
  if (status === "degraded") return "Degraded";
  if (status === "stale") return "Stale data";

  return "Healthy";
}

function statusToneFromText(status: string) {
  if (statusIsDegraded(status)) return "degraded";
  if (status.replace(/[\s_-]/g, "").toLowerCase().includes("ready")) return "healthy";

  return "attention";
}

function importSignalState(latestImport: LatestImportView) {
  if (statusIsDegraded(latestImport.status) || latestImport.rejectedCount > 0) return "degraded";
  if (latestImport.ignoredStaleCount > 0) return "stale";

  return "healthy";
}

function freshnessSignalState(latestImport: LatestImportView | null) {
  if (!latestImport) return "attention";
  if (latestImport.ignoredStaleCount > 0) return "stale";

  return "healthy";
}

function freshnessSummary(latestImport: LatestImportView | null) {
  if (!latestImport) return "No latest synthetic import timestamp is available.";

  const timestamp = latestImport.completedAtUtc ?? latestImport.receivedAtUtc;
  if (latestImport.ignoredStaleCount > 0) {
    return `${latestImport.ignoredStaleCount} stale synthetic record was ignored in the latest import.`;
  }

  return `Latest synthetic import completed at ${timestamp}.`;
}

function statusIsDegraded(status: string) {
  const normalized = status.replace(/[\s_-]/g, "").toLowerCase();

  return (
    normalized.includes("failed") ||
    normalized.includes("error") ||
    normalized.includes("unhealthy") ||
    normalized.includes("unavailable")
  );
}

function humanizeScenarioId(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeReadiness(value: string): PlannerReadinessStatus {
  const normalized = value.replace(/[\s_-]/g, "").toLowerCase();
  if (normalized === "ready") return "ready";
  if (normalized === "needsreview") return "needs-review";
  return "blocked";
}

function isReadyRecommendation(recommendation: PlannerRecommendation): boolean {
  return (
    recommendation.sourceDataReadiness.status === "ready" &&
    recommendation.blockers.length === 0 &&
    !recommendation.status.toLowerCase().includes("blocked")
  );
}

function isBlockedRecommendation(recommendation: PlannerRecommendation): boolean {
  return (
    recommendation.sourceDataReadiness.status === "blocked" ||
    recommendation.blockers.length > 0 ||
    recommendation.status.toLowerCase().includes("blocked")
  );
}

function hasDeferredDecision(recommendation: PlannerRecommendation): boolean {
  return (
    recommendation.status.toLowerCase().includes("deferred") ||
    recommendation.decisions.some((decision) => decision.decision.toLowerCase() === "deferred")
  );
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
