import { PlannerEmptyState, type PlannerEmptyStateProps } from "../../feedback";

export type EmptyStateProps = PlannerEmptyStateProps;

export function EmptyState(props: EmptyStateProps) {
  return <PlannerEmptyState {...props} />;
}
