import type { Tone } from "@maintenance-planning/ui-library";

export type PlannerDecisionAction = {
  readonly actionCode: string;
  readonly decision: "Accepted" | "Rejected" | "Deferred";
  readonly description: string;
  readonly label: string;
  readonly reasonCode: string;
  readonly tone: Tone;
};

export const plannerDecisionActions = [
  {
    actionCode: "accept",
    decision: "Accepted",
    description: "Package the ready work order group for planner follow-through.",
    label: "Accept package",
    reasonCode: "planner-accepted",
    tone: "success"
  },
  {
    actionCode: "reject:planning-conflict",
    decision: "Rejected",
    description: "Record that this grouping should not move forward as presented.",
    label: "Reject package",
    reasonCode: "planning-conflict",
    tone: "critical"
  },
  {
    actionCode: "defer:missing-parts",
    decision: "Deferred",
    description: "Hold the package while parts availability is reviewed.",
    label: "Missing parts",
    reasonCode: "missing-parts",
    tone: "warning"
  },
  {
    actionCode: "defer:crew",
    decision: "Deferred",
    description: "Hold the package until crew availability is clearer.",
    label: "Crew availability",
    reasonCode: "crew-unavailable",
    tone: "warning"
  },
  {
    actionCode: "defer:access-window",
    decision: "Deferred",
    description: "Hold the package until the access window is confirmed.",
    label: "Access window",
    reasonCode: "access-window-moved",
    tone: "warning"
  },
  {
    actionCode: "defer:data-issue",
    decision: "Deferred",
    description: "Hold the package while source-system-shaped data is corrected.",
    label: "Data issue",
    reasonCode: "source-data-issue",
    tone: "warning"
  }
] as const satisfies readonly PlannerDecisionAction[];

export function resolvePlannerDecisionAction(actionCode: string): PlannerDecisionAction {
  const action = plannerDecisionActions.find((candidate) => candidate.actionCode === actionCode);

  if (!action) {
    throw new Error(`Unknown planner decision action: ${actionCode}`);
  }

  return action;
}

export function normaliseDecisionNotes(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 500) : null;
}
