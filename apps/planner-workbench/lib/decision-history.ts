import type { PlannerDecisionRecord } from "@maintenance-planning/services";

export function decisionHistoryItemKey(decision: PlannerDecisionRecord, index: number) {
  return [
    decision.id,
    decision.workOrderId ?? "package",
    decision.decidedAtUtc,
    decision.reasonCode,
    index
  ].join(":");
}
