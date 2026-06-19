import type {
  PlannerDecisionRecord,
  PlannerRecommendation,
  PlannerRecommendationSet,
  PlannerReadinessStatus,
  PlannerWorkOrderState,
  WorkOrderBacklogView,
  WorkOrderBacklogItem
} from "@maintenance-planning/services";
import type { MetricSummaryItem, Tone } from "@maintenance-planning/ui-library";

export function buildBacklogMetrics(backlog: WorkOrderBacklogView): readonly MetricSummaryItem[] {
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
): readonly MetricSummaryItem[] {
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
): readonly MetricSummaryItem[] {
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

export function workOrderIssueText(item: WorkOrderBacklogItem): string {
  if (item.readinessIssueDetail) return item.readinessIssueDetail;
  if (item.blockerCodes.length > 0) return item.blockerCodes.join(", ");
  if (item.latestDecision) return latestDecisionText(item.latestDecision);

  return "Ready for planner review";
}

export function toneForReadiness(status: PlannerReadinessStatus): Tone {
  if (status === "ready") return "success";
  if (status === "needs-review") return "warning";
  return "critical";
}

export function toneForPlannerState(state: PlannerWorkOrderState): Tone {
  if (state === "ready") return "success";
  if (state === "deferred") return "info";
  return "warning";
}

export function toneForDecision(decision: string | null | undefined): Tone {
  const normalized = decision?.toLowerCase();

  if (normalized === "accepted") return "success";
  if (normalized === "rejected") return "critical";
  if (normalized === "deferred") return "warning";

  return "neutral";
}

export function toneForStatus(status: string): Tone {
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
