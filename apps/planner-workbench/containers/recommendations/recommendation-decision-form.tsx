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
  const deferActions = plannerDecisionActions.filter((action) => action.decision === "Deferred");
  const rejectAction = plannerDecisionActions.find((action) => action.decision === "Rejected");

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
      <div className="decision-split" role="group" aria-label="Planner decision actions">
        <button
          className="decision-button decision-button-success decision-button-primary"
          disabled={!readyForAcceptance}
          name="actionCode"
          type="submit"
          value="accept"
        >
          <span>Accept package</span>
          <small>
            {readyForAcceptance
              ? "Package the ready work order group for planner follow-through."
              : "Resolve blockers before accepting."}
          </small>
        </button>

        <button
          className="decision-button decision-button-critical"
          name="actionCode"
          type="submit"
          value="reject:planning-conflict"
        >
          <span>Reject package</span>
          <small>
            {rejectAction?.description ??
              "Record that this grouping should not move forward as presented."}
          </small>
        </button>

        <fieldset className="decision-defer">
          <legend>Defer package</legend>
          <div className="decision-reason-grid">
            {deferActions.map((action, index) => (
              <label className="decision-reason" key={action.actionCode}>
                <input
                  defaultChecked={index === 0}
                  name="deferActionCode"
                  type="radio"
                  value={action.actionCode}
                />
                <span>
                  <strong>{action.label}</strong>
                  <small>{action.description}</small>
                </span>
              </label>
            ))}
          </div>
          <button
            className="decision-button decision-button-warning"
            name="actionCode"
            type="submit"
            value="defer"
          >
            <span>Defer package</span>
            <small>Hold the package with the selected reason.</small>
          </button>
        </fieldset>
      </div>
    </form>
  );
}
