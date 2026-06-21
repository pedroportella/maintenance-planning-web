import type { PlannerRecommendation } from "@maintenance-planning/services";
import { plannerDecisionActions } from "@/lib/planner-decisions";
import { isReadyRecommendation } from "@/lib/planner-format";
import { recordRecommendationDecision } from "./recommendation-decision-actions";

type RecommendationDecisionFormProps = {
  recommendation: PlannerRecommendation;
  planningRunId: string;
};

export function RecommendationDecisionForm({
  recommendation,
  planningRunId
}: RecommendationDecisionFormProps) {
  const readyForAcceptance = isReadyRecommendation(recommendation);

  return (
    <form
      action={recordRecommendationDecision}
      aria-label={`Record planner decision for ${recommendation.packageNumber}`}
      className="decision-form"
    >
      <input name="packageId" type="hidden" value={recommendation.packageId} />
      <input name="planningRunId" type="hidden" value={planningRunId} />
      {recommendation.workOrders.map((workOrder) => (
        <input
          key={workOrder.id}
          name="workOrderIds"
          type="hidden"
          value={workOrder.id}
        />
      ))}
      <label className="decision-notes">
        <span>Decision note</span>
        <textarea
          name="notes"
          placeholder="Optional synthetic planner note"
          rows={2}
        />
      </label>
      <div className="decision-actions" role="group" aria-label="Planner decision actions">
        {plannerDecisionActions.map((action) => {
          const disabled = action.decision === "Accepted" && !readyForAcceptance;

          return (
            <button
              className={`decision-button decision-button-${action.tone}`}
              disabled={disabled}
              key={action.actionCode}
              name="actionCode"
              type="submit"
              value={action.actionCode}
            >
              <span>{action.label}</span>
              <small>{disabled ? "Resolve blockers before accepting." : action.description}</small>
            </button>
          );
        })}
      </div>
    </form>
  );
}
