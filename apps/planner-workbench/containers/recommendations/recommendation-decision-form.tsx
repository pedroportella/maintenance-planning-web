import {
  PlannerDecisionPanel,
  type PlannerDecisionKind,
  type PlannerDecisionPanelAction,
  type PlannerDecisionPanelBlocker
} from "@maintenance-planning/ui-library";
import type { ReactNode } from "react";
import type { PlannerRecommendation } from "@maintenance-planning/services";
import { plannerDecisionActions } from "@/lib/planner-decisions";
import {
  acceptDisabledReason,
  formatHours,
  isReadyRecommendation,
  toneForReadiness
} from "@/lib/planner-format";
import { recordRecommendationDecision } from "./recommendation-decision-actions";

type RecommendationDecisionFormProps = {
  defaultDecision?: PlannerDecisionKind;
  defaultDeferActionCode?: string;
  recommendation: PlannerRecommendation;
  planningRunId: string;
  secondaryAction?: ReactNode;
  title?: ReactNode;
};

export function RecommendationDecisionForm({
  defaultDecision,
  defaultDeferActionCode,
  recommendation,
  planningRunId,
  secondaryAction,
  title
}: RecommendationDecisionFormProps) {
  const readyForAcceptance = isReadyRecommendation(recommendation);
  const actions: readonly PlannerDecisionPanelAction[] = plannerDecisionActions.map((action) =>
    action.decision === "Accepted"
      ? {
          ...action,
          disabled: !readyForAcceptance,
          disabledDescription: acceptDisabledReason(recommendation)
        }
      : action
  );
  const blockers: readonly PlannerDecisionPanelBlocker[] = recommendation.blockers.map(
    (blocker, index) => ({
      id: `${blocker.code}-${index}`,
      label: blocker.code,
      summary: blocker.summary
    })
  );

  return (
    <PlannerDecisionPanel
      actions={actions}
      blockers={blockers}
      defaultDecision={defaultDecision}
      defaultDeferActionCode={defaultDeferActionCode}
      facts={[
        {
          id: "package",
          label: "Package",
          value: recommendation.packageNumber
        },
        {
          id: "readiness",
          label: "Readiness",
          tone: toneForReadiness(recommendation.sourceDataReadiness.status),
          value: recommendation.sourceDataReadiness.status
        },
        {
          id: "work-orders",
          label: "Work orders",
          value: recommendation.workOrders.length
        },
        {
          id: "estimated-work",
          label: "Estimated work",
          value: formatHours(recommendation.estimatedHours)
        }
      ]}
      packageId={recommendation.packageId}
      packageNumber={recommendation.packageNumber}
      planningRunId={planningRunId}
      recordAction={recordRecommendationDecision}
      secondaryAction={secondaryAction}
      title={title}
      workOrderIds={recommendation.workOrders.map((workOrder) => workOrder.id)}
    />
  );
}
