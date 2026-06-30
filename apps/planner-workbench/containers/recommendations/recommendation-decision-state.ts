import type {
  PlannerDecisionKind
} from "@maintenance-planning/ui-library";
import type {
  PlannerDecisionRecord,
  PlannerRecommendation
} from "@maintenance-planning/services";
import { plannerDecisionActions } from "../../lib/planner-decisions";
import {
  readRecommendationSearchParam,
  type RecommendationSearchParams
} from "./recommendation-search-params";

const changeDecisionParam = "changeDecision";

export function isChangeDecisionRequested(params: RecommendationSearchParams): boolean {
  const value = readRecommendationSearchParam(params, changeDecisionParam);

  return value === "true" || value === "1";
}

export function latestRecommendationDecision(
  recommendation: Pick<PlannerRecommendation, "decisions">
): PlannerDecisionRecord | undefined {
  return recommendation.decisions.at(-1);
}

export function decisionKindFromLatest(
  decision: PlannerDecisionRecord | null | undefined
): PlannerDecisionKind | undefined {
  if (
    decision?.decision === "Accepted" ||
    decision?.decision === "Deferred" ||
    decision?.decision === "Rejected"
  ) {
    return decision.decision;
  }

  return undefined;
}

export function deferActionCodeFromLatest(
  decision: PlannerDecisionRecord | null | undefined
): string | undefined {
  if (decision?.decision !== "Deferred") {
    return undefined;
  }

  return plannerDecisionActions.find(
    (action) => action.decision === "Deferred" && action.reasonCode === decision.reasonCode
  )?.actionCode;
}

export function recommendationDetailQuery(
  planningRunId: string | undefined,
  params: Record<string, string> = {}
): Record<string, string> {
  return planningRunId
    ? {
        planningRunId,
        ...params
      }
    : params;
}

export function changeDecisionQuery(planningRunId: string | undefined): Record<string, string> {
  return recommendationDetailQuery(planningRunId, {
    [changeDecisionParam]: "true"
  });
}
