import type {
  OperationsFreshnessState,
  OperationsPostureState,
  OperationsPostureView,
  PlannerDecisionRecord,
  PlannerRecommendation,
  PlannerRecommendationSet,
  PlannerReadinessStatus,
  PlannerWorkOrderState,
  ScenarioOutcomeState,
  ScenarioOutcomeSummaryView,
  ScenarioOutcomeView,
  SourceDataReadinessView,
  WorkOrderBacklogView,
  WorkOrderBacklogItem
} from "@maintenance-planning/services";
import type {
  PlannerMetricSummaryItem,
  PlannerStatusTone
} from "@maintenance-planning/ui-library";

export type PlannerStateBadgeSpec = {
  readonly id: string;
  readonly label: string;
  readonly tone: PlannerStatusTone;
};

export type BacklogResultSummaryInput = {
  readonly baseRowCount: number;
  readonly filterLabel: string;
  readonly hasSearchQuery: boolean;
  readonly searchMatchCount: number;
  readonly visibleRowCount: number;
};

export type PlannerEvidenceNextAction = {
  readonly primaryHref: string;
  readonly primaryLabel: string;
  readonly secondaryHref?: string;
  readonly secondaryLabel?: string;
  readonly summary: string;
  readonly title: string;
  readonly tone: PlannerStatusTone;
};

export function buildBacklogMetrics(
  backlog: WorkOrderBacklogView
): readonly PlannerMetricSummaryItem[] {
  return [
    {
      detail: "Imported synthetic work orders without a blocker.",
      label: "Ready",
      tone: "success",
      value: String(backlog.counts.ready)
    },
    {
      detail: "Items needing constraint or source-data review.",
      label: "Blocked",
      tone: "warning",
      value: String(backlog.counts.blocked)
    },
    {
      detail: "Items held by a planner decision.",
      label: "Deferred",
      tone: "info",
      value: String(backlog.counts.deferred)
    }
  ];
}

export function buildRecommendationMetrics(
  recommendationSet: PlannerRecommendationSet
): readonly PlannerMetricSummaryItem[] {
  const readyCount = recommendationSet.recommendations.filter(isReadyRecommendation).length;
  const blockedCount = recommendationSet.recommendations.filter(isBlockedRecommendation).length;
  const decidedCount = recommendationSet.recommendations.filter(
    (recommendation) => recommendation.decisions.length > 0
  ).length;

  return [
    {
      detail: "Packages that can move forward from the service response.",
      label: "Ready packages",
      tone: "success",
      value: String(readyCount)
    },
    {
      detail: "Packages with blockers or source-data issues.",
      label: "Cannot package yet",
      tone: blockedCount > 0 ? "warning" : "neutral",
      value: String(blockedCount)
    },
    {
      detail: "Packages with recorded planner decisions.",
      label: "Decision history",
      tone: decidedCount > 0 ? "info" : "neutral",
      value: String(decidedCount)
    }
  ];
}

export function buildPlanningRunMetrics(
  recommendationSet: PlannerRecommendationSet
): readonly PlannerMetricSummaryItem[] {
  const recommendations = recommendationSet.recommendations;

  return [
    {
      detail: "Current service-supplied planning run.",
      label: "Run status",
      tone: toneForStatus(recommendationSet.status),
      value: recommendationSet.status
    },
    {
      detail: "Package recommendations returned for review.",
      label: "Recommendations",
      tone: "info",
      value: String(recommendations.length)
    },
    {
      detail: "Work orders included in this run.",
      label: "Work orders",
      tone: "neutral",
      value: String(recommendations.reduce((total, item) => total + item.workOrders.length, 0))
    }
  ];
}

export function buildOperationsMetrics(
  posture: OperationsPostureView,
  sourceReadiness: SourceDataReadinessView,
  latestOutcome: ScenarioOutcomeView
): readonly PlannerMetricSummaryItem[] {
  return [
    {
      detail: posture.summary,
      label: "Posture",
      tone: toneForPostureState(posture.state),
      value: titleCase(posture.state)
    },
    {
      detail: sourceReadiness.summary,
      label: "Source-data readiness",
      tone: toneForReadiness(sourceReadiness.status),
      value: titleCase(sourceReadiness.status)
    },
    {
      detail: `${latestOutcome.runNumber} is the current synthetic outcome.`,
      label: "Latest scenario",
      tone: toneForScenarioOutcome(latestOutcome.status),
      value: latestOutcome.statusText
    }
  ];
}

export function buildScenarioOutcomeMetrics(
  summary: ScenarioOutcomeSummaryView
): readonly PlannerMetricSummaryItem[] {
  const healthyCount = summary.outcomes.filter((outcome) => outcome.status === "healthy").length;
  const staleCount = summary.outcomes.filter((outcome) => outcome.status === "stale").length;
  const degradedCount = summary.outcomes.filter((outcome) => outcome.status === "degraded").length;

  return [
    {
      detail: "Synthetic scenario outcomes with expected posture evidence.",
      label: "Healthy",
      tone: "success",
      value: String(healthyCount)
    },
    {
      detail: "Outcomes where stale source rows stayed visible.",
      label: "Stale data",
      tone: staleCount > 0 ? "warning" : "neutral",
      value: String(staleCount)
    },
    {
      detail: "Outcomes with rejected rows or degraded posture signals.",
      label: "Needs attention",
      tone: degradedCount > 0 ? "critical" : "neutral",
      value: String(degradedCount)
    }
  ];
}

export function buildOperationsNextAction(
  posture: OperationsPostureView,
  latestOutcome: ScenarioOutcomeView
): PlannerEvidenceNextAction | null {
  const hasBlockedPackages = latestOutcome.blockedPackageCount > 0;
  const blockedPackages = formatPackageGroupCount(latestOutcome.blockedPackageCount);
  const latestRunHref = `/planning-runs/${latestOutcome.planningRunId}`;

  if (posture.state === "healthy" && !hasBlockedPackages) {
    return null;
  }

  if (posture.state === "degraded") {
    return {
      primaryHref: latestRunHref,
      primaryLabel: "Review latest run",
      secondaryHref: "/scenario-outcomes",
      secondaryLabel: "Compare scenario outcomes",
      summary: hasBlockedPackages
        ? `Open the latest run before packaging: ${blockedPackages} and degraded import evidence need attention.`
        : "Compare scenario outcomes before using degraded posture evidence for planner decisions.",
      title: "Recommended next step",
      tone: "critical"
    };
  }

  if (posture.state === "stale" || posture.freshness === "stale") {
    return {
      primaryHref: "/scenario-outcomes",
      primaryLabel: "Compare scenario outcomes",
      secondaryHref: latestRunHref,
      secondaryLabel: "Review latest run",
      summary: hasBlockedPackages
        ? `Compare stale import evidence in scenario outcomes, then inspect ${blockedPackages} in the latest run.`
        : "Compare stale import evidence in scenario outcomes before committing planner decisions.",
      title: "Recommended next step",
      tone: "warning"
    };
  }

  return {
    primaryHref: hasBlockedPackages ? latestRunHref : "/scenario-outcomes",
    primaryLabel: hasBlockedPackages ? "Review latest run" : "Compare scenario outcomes",
    secondaryHref: hasBlockedPackages ? "/scenario-outcomes" : latestRunHref,
    secondaryLabel: hasBlockedPackages ? "Compare scenario outcomes" : "Review latest run",
    summary: hasBlockedPackages
      ? `Open the latest run and inspect ${blockedPackages} before packaging ready work.`
      : "Check source-data readiness evidence before continuing planner review.",
    title: "Recommended next step",
    tone: "warning"
  };
}

export function buildScenarioNextAction(
  latest: ScenarioOutcomeView,
  attentionCount: number
): PlannerEvidenceNextAction | null {
  if (attentionCount === 0) {
    return null;
  }

  const latestRunHref = `/planning-runs/${latest.planningRunId}`;

  if (latest.status === "degraded") {
    const hasBlockedPackages = latest.blockedPackageCount > 0;

    return {
      primaryHref: latestRunHref,
      primaryLabel: "Review latest run",
      secondaryHref: "/recommendations",
      secondaryLabel: "Review recommendations",
      summary: hasBlockedPackages
        ? `Open ${latest.runNumber} and review ${formatPackageGroupCount(latest.blockedPackageCount)} before using this scenario as planner evidence.`
        : `Open ${latest.runNumber} and compare degraded evidence before planner decisions.`,
      title: "Recommended next step",
      tone: "critical"
    };
  }

  if (latest.status === "stale") {
    return {
      primaryHref: "/operations-posture",
      primaryLabel: "Check operations posture",
      secondaryHref: latestRunHref,
      secondaryLabel: "Review latest run",
      summary: `Check operations posture for stale import evidence, then review package readiness in ${latest.runNumber}.`,
      title: "Recommended next step",
      tone: "warning"
    };
  }

  return {
    primaryHref: "/operations-posture",
    primaryLabel: "Check operations posture",
    secondaryHref: "/recommendations",
    secondaryLabel: "Review recommendations",
    summary: "Compare the stale or degraded outcome rows with operations posture before continuing planner review in the current run.",
    title: "Recommended next step",
    tone: "warning"
  };
}

export function buildCoordinationExceptionMetrics(
  backlog: WorkOrderBacklogView,
  exceptionCount: number
): readonly PlannerMetricSummaryItem[] {
  return [
    {
      detail: "Backlog rows with blockers, deferrals or source-data review needs.",
      label: "Exceptions",
      tone: exceptionCount > 0 ? "warning" : "success",
      value: String(exceptionCount)
    },
    {
      detail: "Items blocked before planner packaging.",
      label: "Blocked",
      tone: backlog.counts.blocked > 0 ? "warning" : "neutral",
      value: String(backlog.counts.blocked)
    },
    {
      detail: "Items held by a planner decision.",
      label: "Deferred",
      tone: backlog.counts.deferred > 0 ? "info" : "neutral",
      value: String(backlog.counts.deferred)
    }
  ];
}

export function formatUtc(value: string | null | undefined): string {
  if (!value) return "Not set";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  const iso = parsed.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

export function formatHours(value: number | null | undefined): string {
  return typeof value === "number" ? `${value} h` : "No estimate";
}

export function latestDecisionText(decision: PlannerDecisionRecord | null | undefined): string {
  if (!decision) return "No decision recorded";

  return `${decision.decision} for ${decision.reasonCode}`;
}

export function recommendationStateBadgeSpecs(
  recommendation: Pick<PlannerRecommendation, "sourceDataReadiness" | "status">
): readonly PlannerStateBadgeSpec[] {
  const packageStatusLabel = formatStateLabel(recommendation.status);
  const readinessLabel = formatStateLabel(recommendation.sourceDataReadiness.status);

  if (sameStateLabel(recommendation.status, recommendation.sourceDataReadiness.status)) {
    return [
      {
        id: "package-state",
        label: packageStatusLabel,
        tone: toneForStatus(recommendation.status)
      }
    ];
  }

  return [
    {
      id: "package-status",
      label: `Package ${packageStatusLabel}`,
      tone: toneForStatus(recommendation.status)
    },
    {
      id: "readiness",
      label: `Readiness ${readinessLabel}`,
      tone: toneForReadiness(recommendation.sourceDataReadiness.status)
    }
  ];
}

export function workOrderStateBadgeSpecs(
  item: Pick<WorkOrderBacklogItem, "plannerState" | "readinessStatus">
): readonly PlannerStateBadgeSpec[] {
  const readinessLabel = formatStateLabel(item.readinessStatus);
  const plannerStateLabel = formatStateLabel(item.plannerState);

  if (sameStateLabel(item.readinessStatus, item.plannerState)) {
    return [
      {
        id: "work-order-state",
        label: readinessLabel,
        tone: toneForReadiness(item.readinessStatus)
      }
    ];
  }

  return [
    {
      id: "readiness",
      label: `Readiness ${readinessLabel}`,
      tone: toneForReadiness(item.readinessStatus)
    },
    {
      id: "planner-state",
      label: `Planner ${plannerStateLabel}`,
      tone: toneForPlannerState(item.plannerState)
    }
  ];
}

export function formatBacklogResultSummary({
  baseRowCount,
  filterLabel,
  hasSearchQuery,
  searchMatchCount,
  visibleRowCount
}: BacklogResultSummaryInput): string {
  const baseLabel = `${filterLabel.toLowerCase()} rows`;

  if (!hasSearchQuery) {
    return `${visibleRowCount} shown from ${baseRowCount} ${baseLabel}`;
  }

  const matchLabel = searchMatchCount === 1 ? "search match" : "search matches";

  return `${visibleRowCount} shown from ${baseRowCount} ${baseLabel} after ${searchMatchCount} ${matchLabel}`;
}

export function acceptDisabledReason(recommendation: PlannerRecommendation): string | undefined {
  if (isReadyRecommendation(recommendation)) {
    return undefined;
  }

  const blockerSummaries = recommendation.blockers
    .map((blocker) => blocker.summary)
    .filter((summary) => summary.length > 0);

  return blockerSummaries.length > 0
    ? `Cannot accept yet: ${blockerSummaries.join(" ")}`
    : "Cannot accept yet: resolve package blockers before accepting.";
}

export function workOrderIssueText(item: WorkOrderBacklogItem): string {
  if (item.readinessIssueDetail) return item.readinessIssueDetail;
  if (item.blockerCodes.length > 0) return item.blockerCodes.join(", ");
  if (item.latestDecision) return latestDecisionText(item.latestDecision);

  return "Ready for planner review";
}

export function toneForReadiness(status: PlannerReadinessStatus): PlannerStatusTone {
  if (status === "ready") return "success";
  if (status === "needs-review") return "warning";
  return "critical";
}

export function toneForPlannerState(state: PlannerWorkOrderState): PlannerStatusTone {
  if (state === "ready") return "success";
  if (state === "deferred") return "info";
  return "warning";
}

export function toneForPostureState(state: OperationsPostureState): PlannerStatusTone {
  if (state === "healthy") return "success";
  if (state === "degraded") return "critical";
  if (state === "stale") return "warning";

  return "info";
}

export function toneForFreshness(freshness: OperationsFreshnessState): PlannerStatusTone {
  if (freshness === "fresh") return "success";
  if (freshness === "stale") return "warning";
  if (freshness === "missing") return "info";

  return "critical";
}

export function toneForScenarioOutcome(status: ScenarioOutcomeState): PlannerStatusTone {
  if (status === "healthy") return "success";
  if (status === "stale") return "warning";

  return "critical";
}

export function toneForDecision(decision: string | null | undefined): PlannerStatusTone {
  const normalized = decision?.toLowerCase();

  if (normalized === "accepted") return "success";
  if (normalized === "rejected") return "critical";
  if (normalized === "deferred") return "warning";

  return "neutral";
}

export function toneForStatus(status: string): PlannerStatusTone {
  const normalized = status.replace(/[\s_-]/g, "").toLowerCase();

  if (normalized.includes("ready") || normalized.includes("completed")) return "success";
  if (normalized.includes("blocked") || normalized.includes("failed")) return "critical";
  if (normalized.includes("review") || normalized.includes("deferred")) return "warning";

  return "neutral";
}

export function isReadyRecommendation(recommendation: PlannerRecommendation): boolean {
  return (
    recommendation.sourceDataReadiness.status === "ready" &&
    recommendation.blockers.length === 0 &&
    !recommendation.status.toLowerCase().includes("blocked")
  );
}

export function isBlockedRecommendation(recommendation: PlannerRecommendation): boolean {
  return (
    recommendation.sourceDataReadiness.status === "blocked" ||
    recommendation.blockers.length > 0 ||
    recommendation.status.toLowerCase().includes("blocked")
  );
}

export function formatStateLabel(value: string): string {
  const spaced = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[\s_-]+/g, " ")
    .trim();

  if (!spaced) return value;

  return spaced
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function sameStateLabel(left: string, right: string): boolean {
  return stateKey(left) === stateKey(right);
}

function stateKey(value: string): string {
  return value.replace(/[\s_-]/g, "").toLowerCase();
}

function formatPackageGroupCount(count: number): string {
  return `${count} blocked package group${count === 1 ? "" : "s"}`;
}

const titleCase = formatStateLabel;
