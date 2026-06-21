import { workbenchIconNames } from "@maintenance-planning/ui-assets";
import {
  Alert,
  DataTable,
  MetricSummary,
  PageHeader,
  SegmentedNav,
  StatusBadge,
  WorkbenchPanel,
  type DataTableColumn
} from "@maintenance-planning/ui-library";
import {
  getWorkbenchSection,
  getPrimaryCoordinationSection,
  workbenchSections
} from "@maintenance-planning/utils";
import Link from "next/link";
import { getLucideIcon } from "@/components/lucide-icon";
import {
  coordinationQueueItems,
  plannerConsoleSections,
  plannerConsoleSummary,
  type CoordinationQueueItem
} from "@/lib/planner-console-data";

const coordinationColumns: readonly DataTableColumn<CoordinationQueueItem>[] = [
  {
    header: "Work order",
    key: "work-order",
    render: (item) => (
      <span className="table-stack">
        <strong>{item.workOrderNumber}</strong>
        <span>{item.title}</span>
      </span>
    )
  },
  {
    header: "Readiness",
    key: "readiness",
    render: (item) => <StatusBadge tone={item.statusTone}>{item.readiness}</StatusBadge>
  },
  {
    header: "Coordination note",
    key: "issue",
    render: (item) => item.issue
  },
  {
    header: "Package",
    key: "package",
    render: (item) => item.packageNumber
  },
  {
    align: "end",
    header: "Due",
    key: "due",
    render: (item) => item.due
  },
  {
    header: "Route",
    key: "route",
    render: (item) => {
      const section = getWorkbenchSection(item.routeSlug);

      return (
        <Link className="table-link" href={section.path}>
          {section.label}
        </Link>
      );
    }
  }
];

export default function HomePage() {
  const primarySection = getPrimaryCoordinationSection();
  const ForwardIcon = getLucideIcon(workbenchIconNames.actions.forward);
  const ReviewIcon = getLucideIcon(workbenchIconNames.actions.review);

  return (
    <main className="page-stack">
      <PageHeader
        actions={
          <Link className="primary-link" href={primarySection.path}>
            <ReviewIcon aria-hidden="true" size={18} />
            Review coordination
            <ForwardIcon aria-hidden="true" size={16} />
          </Link>
        }
        badge={<StatusBadge tone="info">Static mock shell</StatusBadge>}
        description="Scan synthetic work orders that need planner coordination before later service-backed recommendation views are added."
        title="Planner coordination queue"
      />

      <div className="console-toolbar">
        <SegmentedNav ariaLabel="Workbench page sections" options={plannerConsoleSections} />
        <StatusBadge tone="neutral">No backend required</StatusBadge>
      </div>

      <MetricSummary ariaLabel="Planner coordination summary" items={plannerConsoleSummary} />

      <Alert title="Local review scope" tone="info">
        <p>
          This shell uses synthetic static rows to exercise the planner layout. It does not call a
          live API or claim source-system connectivity.
        </p>
      </Alert>

      <WorkbenchPanel className="console-panel" labelledBy="coordination-queue">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Work orders needing coordination</p>
            <h2 id="coordination-queue">Coordination queue</h2>
          </div>
          <StatusBadge tone="warning">Planner attention</StatusBadge>
        </div>
        <DataTable
          caption="Synthetic coordination queue"
          columns={coordinationColumns}
          getRowKey={(item) => item.workOrderNumber}
          rows={coordinationQueueItems}
        />
      </WorkbenchPanel>

      <WorkbenchPanel className="console-panel" labelledBy="route-map">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Workbench routes</p>
            <h2 id="route-map">Task map</h2>
          </div>
          <StatusBadge tone="neutral">Component shell</StatusBadge>
        </div>
        <Link className="primary-link" href={primarySection.path}>
          <ReviewIcon aria-hidden="true" size={18} />
          Review coordination
          <ForwardIcon aria-hidden="true" size={16} />
        </Link>
        <div className="task-grid">
          {workbenchSections.map((section) => (
            <Link className="task-card" href={section.path} key={section.slug}>
              <span className={`task-accent task-accent-${section.tone}`} aria-hidden="true" />
              <span>
                <strong>{section.label}</strong>
                <small>{section.coordinationCue}</small>
              </span>
              <ForwardIcon aria-hidden="true" size={16} />
            </Link>
          ))}
        </div>
      </WorkbenchPanel>
    </main>
  );
}
