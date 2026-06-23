import type { ReactNode } from "react";
import {
  PlannerEmptyState,
  PlannerLoadingState,
  type PlannerLoadingStateProps
} from "../../feedback";

export type LoadingStateProps = PlannerLoadingStateProps;

export type ErrorStateProps = {
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  title: string;
};

export function LoadingState(props: LoadingStateProps) {
  return <PlannerLoadingState {...props} />;
}

export function ErrorState({ action, className, description, title }: ErrorStateProps) {
  return (
    <PlannerEmptyState
      action={action}
      className={className}
      description={description}
      role="alert"
      title={title}
      tone="critical"
    />
  );
}
