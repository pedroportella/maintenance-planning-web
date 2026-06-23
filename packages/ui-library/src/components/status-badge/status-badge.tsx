import {
  PlannerStatusBadge,
  PlannerStatusPill,
  type PlannerStatusBadgeProps,
  type PlannerStatusTone
} from "../../feedback";

export type Tone = PlannerStatusTone;

export type StatusBadgeProps = PlannerStatusBadgeProps;

export function StatusBadge(props: StatusBadgeProps) {
  return <PlannerStatusBadge {...props} />;
}

export const StatusPill = PlannerStatusPill;
