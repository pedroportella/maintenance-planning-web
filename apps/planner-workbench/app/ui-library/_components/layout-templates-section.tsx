import {
  PlannerAppLayout,
  PlannerContentSection,
  PlannerPageHeader,
  PlannerResponsiveGrid,
  PlannerSideNav,
  PlannerWorkflowLayout,
  RadixBadge,
  RadixButton,
  RadixCallout,
  RadixLink,
  RadixText
} from "@maintenance-planning/ui-library";
import { layoutFixtureNavItems } from "./showcase-fixtures";

export function LayoutTemplatesSection() {
  return (
    <PlannerContentSection
      badge={<RadixBadge tone="success">RU2</RadixBadge>}
      description="Shell, page and workflow templates render through the Planner layout boundary."
      eyebrow="Layout family"
      title="App shell layout templates"
      titleId="showcase-layout-templates"
      variant="surface"
    >
      <PlannerAppLayout
        activeHref="/recommendations"
        brand={{
          ariaLabel: "Planner workbench home",
          href: "/",
          name: "Planner Workbench",
          tagline: "Synthetic planning review"
        }}
        className="planner-app-layout-fixture"
        contentId="showcase-shell-content"
        navAriaLabel="Planner shell fixture sections"
        navItems={layoutFixtureNavItems}
        sidebarNote="Layout fixtures use synthetic data and local navigation only."
      >
        <PlannerPageHeader
          actions={<RadixButton variant="soft">Review queue</RadixButton>}
          badge={<RadixBadge tone="info">Desktop shell</RadixBadge>}
          description="The route body sits behind a shell-owned header, grouped navigation and skip target."
          eyebrow="Shell fixture"
          title="Recommendation review"
          titleId="showcase-shell-title"
        />
        <PlannerContentSection
          badge={<RadixBadge tone="neutral">Template</RadixBadge>}
          description="Content sections carry recurring section headings without route-local shell CSS."
          title="Ready for planner review"
          titleId="showcase-shell-section"
        >
          <RadixCallout title="Boundary evidence" tone="info">
            The fixture keeps links and route state outside ui-library while layout behaviour stays
            inside the Planner templates.
          </RadixCallout>
        </PlannerContentSection>
      </PlannerAppLayout>

      <PlannerResponsiveGrid>
        <PlannerSideNav
          activeHref="/work-order-backlog"
          ariaLabel="Standalone side navigation fixture"
          items={layoutFixtureNavItems}
        />
        <PlannerWorkflowLayout
          actions={<RadixButton>Save decision</RadixButton>}
          backLink={<RadixLink href="/recommendations">Back to queue</RadixLink>}
          contextLabel="Decision workflow"
          lead="Workflow pages can reduce shell chrome while preserving heading, lead and action rhythm."
          progress={<RadixBadge tone="warning">Step 2 of 3</RadixBadge>}
          title="Package decision"
          titleId="showcase-workflow-title"
        >
          <RadixText as="p" tone="muted">
            The workflow template keeps task copy compact and leaves decision controls for RU6.
          </RadixText>
        </PlannerWorkflowLayout>
      </PlannerResponsiveGrid>
    </PlannerContentSection>
  );
}
