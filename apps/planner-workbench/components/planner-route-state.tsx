import {
  PlannerContentSection,
  PlannerEmptyState,
  PlannerLoadingState,
  PlannerPage,
  PlannerPageHeader,
  PlannerStatusBadge
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
    <PlannerPage>
      <PlannerPageHeader
        badge={<PlannerStatusBadge tone={tone}>{issue.kind}</PlannerStatusBadge>}
        description={description}
        title={title}
      />
      <PlannerContentSection variant="surface">
        <PlannerEmptyState
          description={issue.description}
          role="alert"
          title={issue.title}
          tone="critical"
        />
      </PlannerContentSection>
    </PlannerPage>
  );
}

type PlannerRouteLoadingProps = {
  title: string;
};

export function PlannerRouteLoading({ title }: PlannerRouteLoadingProps) {
  return (
    <PlannerPage>
      <PlannerPageHeader
        badge={<PlannerStatusBadge tone="info">Loading</PlannerStatusBadge>}
        description="Preparing the synthetic planner review state through the service boundary."
        title={title}
      />
      <PlannerContentSection variant="surface">
        <PlannerLoadingState label="Loading planner review data" skeletonRows={3} />
      </PlannerContentSection>
    </PlannerPage>
  );
}
