import {
  Alert,
  DataTable,
  MetricSummary,
  PageHeader,
  StatusBadge,
  WorkbenchPanel,
  type DataTableColumn
} from "@maintenance-planning/ui-library";
import { getWorkbenchSection, type WorkbenchSectionSlug } from "@maintenance-planning/utils";
import type { PlannerTask } from "@maintenance-planning/utils";

const placeholderTaskColumns: readonly DataTableColumn<PlannerTask>[] = [
  {
    header: "Task",
    key: "task",
    render: (task) => (
      <span className="table-stack">
        <strong>{task.label}</strong>
        <span>{task.detail}</span>
      </span>
    )
  },
  {
    header: "Status",
    key: "status",
    render: (task) => <StatusBadge tone={task.tone}>{task.status}</StatusBadge>
  }
];

type RoutePlaceholderProps = {
  slug: WorkbenchSectionSlug;
};

export function RoutePlaceholder({ slug }: RoutePlaceholderProps) {
  const section = getWorkbenchSection(slug);

  return (
    <main className="page-stack">
      <PageHeader
        badge={<StatusBadge tone={section.tone}>Route shell</StatusBadge>}
        description={section.summary}
        title={section.label}
      />

      <MetricSummary ariaLabel={`${section.label} summary`} items={[section.metric]} />

      <Alert title="Local shell scope" tone="neutral">
        <p>{section.placeholderBody}</p>
      </Alert>

      <section className="route-grid" aria-label={`${section.label} route details`}>
        <WorkbenchPanel as="article" className="route-card">
          <p className="eyebrow">Planner focus</p>
          <h2>{section.placeholderTitle}</h2>
          <p>{section.coordinationCue}</p>
        </WorkbenchPanel>

        <DataTable
          caption={`${section.label} placeholder tasks`}
          columns={placeholderTaskColumns}
          getRowKey={(task) => task.label}
          rows={section.placeholderTasks}
        />
      </section>
    </main>
  );
}
