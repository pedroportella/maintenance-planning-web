import {
  Alert,
  DataTable,
  EmptyState,
  MetricSummary,
  PageHeader,
  StatusBadge,
  WorkbenchPanel,
  type DataTableColumn
} from "@maintenance-planning/ui-library";
import {
  createPlannerServices,
  type WorkOrderBacklogItem
} from "@maintenance-planning/services";
import { getWorkbenchSection } from "@maintenance-planning/utils";
import Link from "next/link";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import {
  buildBacklogMetrics,
  formatHours,
  formatUtc,
  latestDecisionText,
  toneForDecision,
  toneForPlannerState,
  toneForReadiness,
  workOrderIssueText
} from "@/lib/planner-format";
import { packageRecommendationHref } from "@/containers/recommendations/recommendation-links";

const backlogColumns: readonly DataTableColumn<WorkOrderBacklogItem>[] = [
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
    render: (item) => (
      <span className="badge-stack">
        <StatusBadge tone={toneForReadiness(item.readinessStatus)}>
          {item.readinessStatus}
        </StatusBadge>
        <StatusBadge tone={toneForPlannerState(item.plannerState)}>{item.plannerState}</StatusBadge>
      </span>
    )
  },
  {
    header: "Coordination note",
    key: "issue",
    render: (item) => workOrderIssueText(item)
  },
  {
    header: "Package",
    key: "package",
    render: (item) => (
      <Link className="table-link" href={packageRecommendationHref(item.packageId)}>
        {item.packageNumber}
      </Link>
    )
  },
  {
    align: "end",
    header: "Hours",
    key: "hours",
    render: (item) => formatHours(item.estimatedHours)
  },
  {
    align: "end",
    header: "Due",
    key: "due",
    render: (item) => formatUtc(item.dueAtUtc)
  },
  {
    header: "Latest decision",
    key: "decision",
    render: (item) => (
      <StatusBadge tone={toneForDecision(item.latestDecision?.decision)}>
        {latestDecisionText(item.latestDecision)}
      </StatusBadge>
    )
  }
];

export default async function WorkOrderBacklogPage() {
  const section = getWorkbenchSection("work-order-backlog");

  try {
    const services = createPlannerServices();
    const runtime = services.getRuntimeInfo();
    const backlog = await services.getWorkOrderBacklog();
    const exceptionCount = backlog.counts.blocked + backlog.counts.deferred;

    return (
      <main className="page-stack">
        <PageHeader
          badge={
            <span className="badge-stack">
              <StatusBadge tone="info">Service contract</StatusBadge>
              <StatusBadge tone="neutral">{runtime.mode} mode</StatusBadge>
            </span>
          }
          description="Review imported synthetic work orders, ready packages and coordination exceptions from the planner service boundary."
          title={section.label}
        />

        <MetricSummary ariaLabel="Work-order backlog summary" items={buildBacklogMetrics(backlog)} />

        <Alert title="Planner inbox scope" tone={exceptionCount > 0 ? "warning" : "success"}>
          <p>
            {exceptionCount > 0
              ? `${exceptionCount} synthetic work orders need coordination before they can move cleanly through planning.`
              : "No coordination exceptions are present in this synthetic backlog response."}
          </p>
        </Alert>

        <WorkbenchPanel className="console-panel" labelledBy="backlog-table">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Imported work orders</p>
              <h2 id="backlog-table">Planner inbox</h2>
            </div>
            <StatusBadge tone="neutral">{backlog.counts.total} total</StatusBadge>
          </div>
          <DataTable
            caption="Planner work-order backlog"
            columns={backlogColumns}
            emptyState={
              <EmptyState
                description="The service returned no imported work orders for this synthetic review state."
                title="No backlog items"
              />
            }
            getRowKey={(item) => item.id}
            rows={backlog.items}
          />
        </WorkbenchPanel>
      </main>
    );
  } catch (error) {
    return (
      <PlannerRouteFailure
        description="The backlog route reads from the planner service boundary and keeps source-system-shaped review data server-side."
        error={error}
        title={section.label}
      />
    );
  }
}
