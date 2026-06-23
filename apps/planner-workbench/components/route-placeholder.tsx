import {
  PlannerAlert,
  PlannerContentSection,
  PlannerDataTable,
  PlannerMetricSummary,
  PlannerPage,
  PlannerPageHeader,
  PlannerResponsiveGrid,
  PlannerStatusBadge,
  PlannerTableCellStack,
  type PlannerDataTableColumn
} from "@maintenance-planning/ui-library";
import { getWorkbenchSection, type WorkbenchSectionSlug } from "@maintenance-planning/utils";
import type { PlannerTask } from "@maintenance-planning/utils";

const placeholderTaskColumns: readonly PlannerDataTableColumn<PlannerTask>[] = [
  {
    header: "Task",
    key: "task",
    render: (task) => (
      <PlannerTableCellStack detail={task.detail} title={task.label} />
    )
  },
  {
    header: "Status",
    key: "status",
    render: (task) => <PlannerStatusBadge tone={task.tone}>{task.status}</PlannerStatusBadge>
  }
];

type RoutePlaceholderProps = {
  slug: WorkbenchSectionSlug;
};

export function RoutePlaceholder({ slug }: RoutePlaceholderProps) {
  const section = getWorkbenchSection(slug);

  return (
    <PlannerPage>
      <PlannerPageHeader
        badge={<PlannerStatusBadge tone={section.tone}>Route shell</PlannerStatusBadge>}
        description={section.summary}
        title={section.label}
      />

      <PlannerMetricSummary ariaLabel={`${section.label} summary`} items={[section.metric]} />

      <PlannerAlert title="Local shell scope" tone="neutral">
        <p>{section.placeholderBody}</p>
      </PlannerAlert>

      <PlannerResponsiveGrid
        ariaLabel={`${section.label} route details`}
        as="section"
        balance="secondary"
      >
        <PlannerContentSection
          as="article"
          eyebrow="Planner focus"
          title={section.placeholderTitle}
          variant="surface"
        >
          <p>{section.coordinationCue}</p>
        </PlannerContentSection>

        <PlannerDataTable
          caption={`${section.label} placeholder tasks`}
          columns={placeholderTaskColumns}
          getRowKey={(task) => task.label}
          rows={section.placeholderTasks}
        />
      </PlannerResponsiveGrid>
    </PlannerPage>
  );
}
