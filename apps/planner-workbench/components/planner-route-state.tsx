import {
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
  WorkbenchPanel
} from "@maintenance-planning/ui-library";
import { toPlannerRouteIssue } from "@/lib/planner-route-state";

type PlannerRouteFailureProps = {
  description: string;
  error: unknown;
  title: string;
};

export function PlannerRouteFailure({ description, error, title }: PlannerRouteFailureProps) {
  const issue = toPlannerRouteIssue(error);
  const tone = issue.kind === "unauthorized" || issue.kind === "request" ? "critical" : "warning";

  return (
    <main className="page-stack">
      <PageHeader
        badge={<StatusBadge tone={tone}>{issue.kind}</StatusBadge>}
        description={description}
        title={title}
      />
      <WorkbenchPanel>
        <ErrorState description={issue.description} title={issue.title} />
      </WorkbenchPanel>
    </main>
  );
}

type PlannerRouteLoadingProps = {
  title: string;
};

export function PlannerRouteLoading({ title }: PlannerRouteLoadingProps) {
  return (
    <main className="page-stack">
      <PageHeader
        badge={<StatusBadge tone="info">Loading</StatusBadge>}
        description="Preparing the synthetic planner review state through the service boundary."
        title={title}
      />
      <WorkbenchPanel>
        <LoadingState label="Loading planner review data" />
      </WorkbenchPanel>
    </main>
  );
}
