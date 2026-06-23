import {
  PlannerActionGroup,
  PlannerActionLink,
  PlannerBadgeGroup,
  PlannerContentSection,
  PlannerPage,
  PlannerPageHeader,
  PlannerQuietNote,
  PlannerStatusBadge,
  RadixIcon
} from "@maintenance-planning/ui-library";
import {
  getPrimaryCoordinationSection,
  getWorkbenchSection
} from "@maintenance-planning/utils";
import Link from "next/link";

export default function HomePage() {
  const primarySection = getPrimaryCoordinationSection();
  const backlogSection = getWorkbenchSection("work-order-backlog");
  const postureSection = getWorkbenchSection("operations-posture");
  const scenariosSection = getWorkbenchSection("scenario-outcomes");

  return (
    <PlannerPage width="narrow">
      <PlannerPageHeader
        actions={
          <PlannerActionLink asChild>
            <Link href={primarySection.path}>
              <RadixIcon decorative name="reader" />
              Review recommendations
              <RadixIcon decorative name="arrowRight" />
            </Link>
          </PlannerActionLink>
        }
        badge={<PlannerStatusBadge tone="neutral">Synthetic review</PlannerStatusBadge>}
        description="Start with package recommendations, then use work-order triage and evidence pages when a decision needs more context."
        title="Planner Workbench"
      />

      <PlannerQuietNote title="Local review boundary">
        Synthetic data is read through the server-side planner service boundary. This page does not
        claim live source-system connectivity or production operations evidence.
      </PlannerQuietNote>

      <PlannerContentSection
        actions={<PlannerStatusBadge tone={primarySection.tone}>Start here</PlannerStatusBadge>}
        description={primarySection.coordinationCue}
        eyebrow="Primary workflow"
        title="Review package decisions"
        titleId="launch-primary"
        variant="surface"
      >
        <PlannerActionGroup align="start">
          <PlannerActionLink asChild>
            <Link href={primarySection.path}>
              <RadixIcon decorative name="reader" />
              Open recommendations
              <RadixIcon decorative name="arrowRight" />
            </Link>
          </PlannerActionLink>
        </PlannerActionGroup>

        <PlannerBadgeGroup ariaLabel="Supporting workbench routes" as="div">
          <PlannerActionLink asChild priority="secondary">
            <Link href={backlogSection.path}>{backlogSection.label}</Link>
          </PlannerActionLink>
          <PlannerActionLink asChild priority="secondary">
            <Link href={postureSection.path}>{postureSection.label}</Link>
          </PlannerActionLink>
          <PlannerActionLink asChild priority="secondary">
            <Link href={scenariosSection.path}>{scenariosSection.label}</Link>
          </PlannerActionLink>
        </PlannerBadgeGroup>
      </PlannerContentSection>
    </PlannerPage>
  );
}
