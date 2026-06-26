import {
  PlannerContentSection,
  PlannerMetadataPanel,
  PlannerMetricSummary,
  PlannerResponsiveGrid,
  PlannerStatusBadge,
  PlannerSummaryList
} from "@maintenance-planning/ui-library";

export function MetadataListsSection() {
  return (
    <PlannerContentSection
      badge={<PlannerStatusBadge tone="success">RU4</PlannerStatusBadge>}
      eyebrow="Component family"
      title="Metadata and data lists"
      titleId="showcase-metadata"
      variant="surface"
    >
      <PlannerMetricSummary
        ariaLabel="Showcase metadata metric summary"
        items={[
          {
            detail: "Ready for planner review",
            label: "Ready packages",
            tone: "success",
            value: "12"
          },
          {
            detail: "Needs source-data review",
            label: "Review packages",
            tone: "warning",
            value: "4"
          },
          {
            detail: "Blocked by package facts",
            label: "Blocked packages",
            tone: "critical",
            value: "2"
          }
        ]}
        variant="compact"
      />
      <PlannerResponsiveGrid>
        <PlannerMetadataPanel
          badge={<PlannerStatusBadge tone="info">Desktop</PlannerStatusBadge>}
          description="Standard metadata panels use Radix DataList semantics for package facts."
          eyebrow="Metadata panel"
          items={[
            {
              id: "package",
              label: "Package",
              value: "PKG-PARTS-REPLAN"
            },
            {
              id: "score",
              label: "Score",
              tone: "info",
              value: "91"
            },
            {
              id: "estimated-work",
              label: "Estimated work",
              value: "48h"
            }
          ]}
          summaryAriaLabel="Desktop package metadata"
          title="Package facts"
          titleId="showcase-desktop-metadata"
        />
        <PlannerMetadataPanel
          badge={<PlannerStatusBadge tone="neutral">Tablet</PlannerStatusBadge>}
          density="compact"
          description="Compact metadata keeps repeated facts scannable inside constrained panels."
          eyebrow="Metadata panel"
          items={[
            {
              id: "run",
              label: "Run",
              value: "RUN-BASE-001"
            },
            {
              id: "freshness",
              label: "Freshness",
              tone: "success",
              value: "Current"
            },
            {
              id: "exceptions",
              label: "Exceptions",
              tone: "warning",
              value: "3"
            }
          ]}
          summaryAriaLabel="Tablet run metadata"
          title="Run facts"
          titleId="showcase-tablet-metadata"
        />
        <section aria-label="Phone metadata fixture">
          <h3>Phone fact stack</h3>
          <PlannerSummaryList
            ariaLabel="Phone package readiness facts"
            items={[
              {
                id: "ready",
                label: "Ready",
                tone: "success",
                value: "8"
              },
              {
                id: "review",
                label: "Review",
                tone: "warning",
                value: "2"
              },
              {
                id: "blocked",
                label: "Blocked",
                tone: "critical",
                value: "1"
              }
            ]}
            orientation="vertical"
            variant="compact"
          />
        </section>
      </PlannerResponsiveGrid>
    </PlannerContentSection>
  );
}
