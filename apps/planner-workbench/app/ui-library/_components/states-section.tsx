import {
  PlannerContentSection,
  PlannerEmptyState,
  PlannerLoadingState,
  PlannerResponsiveGrid,
  PlannerStatusBadge
} from "@maintenance-planning/ui-library";

export function StatesSection() {
  return (
    <PlannerContentSection
      badge={<PlannerStatusBadge tone="info">Live-region checks</PlannerStatusBadge>}
      eyebrow="Component family"
      title="Empty, loading and error states"
      titleId="showcase-states"
      variant="surface"
    >
      <PlannerResponsiveGrid>
        <PlannerEmptyState
          description="No synthetic package matches this reviewer filter."
          title="No package selected"
        />
        <PlannerContentSection variant="surface">
          <PlannerLoadingState label="Loading planner review data" skeletonRows={3} />
        </PlannerContentSection>
        <PlannerEmptyState
          description="The service boundary returned a configuration issue for this local review."
          role="alert"
          title="Review state unavailable"
          tone="critical"
        />
      </PlannerResponsiveGrid>
    </PlannerContentSection>
  );
}
