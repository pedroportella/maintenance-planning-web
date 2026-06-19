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
  buildCoordinationExceptionMetrics,
  formatUtc,
  latestDecisionText,
  toneForDecision,
  toneForPlannerState,
  toneForReadiness,
  workOrderIssueText
} from "@/lib/planner-format";

export const dynamic = "force-dynamic";

const exceptionColumns: readonly DataTableColumn<WorkOrderBacklogItem>[] = [
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
    header: "State",
    key: "state",
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
    key: "note",
    render: (item) => workOrderIssueText(item)
  },
  {
    header: "Package",
    key: "package",
    render: (item) => (
      <Link className="table-link" href="/recommendations">
        {item.packageNumber}
      </Link>
    )
  },
  {
    header: "Latest decision",
    key: "decision",
    render: (item) => (
      <StatusBadge tone={toneForDecision(item.latestDecision?.decision)}>
        {latestDecisionText(item.latestDecision)}
      </StatusBadge>
    )
  },
  {
    align: "end",
    header: "Due",
    key: "due",
    render: (item) => formatUtc(item.dueAtUtc)
  }
];

export default async function CoordinationExceptionsPage() {
  const section = getWorkbenchSection("coordination-exceptions");

  try {
    const services = createPlannerServices();
    const runtime = services.getRuntimeInfo();
    const backlog = await services.getWorkOrderBacklog();
    const exceptionItems = backlog.items.filter(isCoordinationException);

    return (
      <main className="page-stack">
        <PageHeader
          actions={
            <span className="action-row">
              <Link className="primary-link" href="/work-order-backlog">
                Open full backlog
              </Link>
              <Link className="secondary-link" href="/operations-posture">
                Open operations posture
              </Link>
            </span>
          }
          badge={
            <span className="badge-stack">
              <StatusBadge tone={exceptionItems.length > 0 ? "warning" : "success"}>
                {exceptionItems.length} exceptions
              </StatusBadge>
              <StatusBadge tone="neutral">{runtime.mode} mode</StatusBadge>
            </span>
          }
          description="Review synthetic work orders with blockers, deferrals or source-data gaps before planner decisions."
          title={section.label}
        />

        <MetricSummary
          ariaLabel="Coordination exception summary"
          items={buildCoordinationExceptionMetrics(backlog, exceptionItems.length)}
        />

        <Alert title="Coordination review scope" tone={exceptionItems.length > 0 ? "warning" : "success"}>
          <p>
            {exceptionItems.length > 0
              ? "These synthetic backlog items need follow-up before they can move cleanly through planner review."
              : "No coordination exceptions are present in this synthetic backlog response."}
          </p>
        </Alert>

        <WorkbenchPanel className="console-panel" labelledBy="coordination-exception-list">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Items needing follow-up</p>
              <h2 id="coordination-exception-list">Exception list</h2>
            </div>
            <StatusBadge tone="neutral">Generated {formatUtc(backlog.generatedAtUtc)}</StatusBadge>
          </div>
          <DataTable
            caption="Coordination exception list"
            columns={exceptionColumns}
            emptyState={
              <EmptyState
                description="The service returned no blocked or deferred backlog items for this review state."
                title="No coordination exceptions"
              />
            }
            getRowKey={(item) => item.id}
            rows={exceptionItems}
          />
        </WorkbenchPanel>
      </main>
    );
  } catch (error) {
    return (
      <PlannerRouteFailure
        description="The coordination-exceptions route filters the service-backed backlog for planner follow-up items."
        error={error}
        title={section.label}
      />
    );
  }
}

function isCoordinationException(item: WorkOrderBacklogItem): boolean {
  return (
    item.readinessStatus !== "ready" ||
    item.plannerState !== "ready" ||
    item.blockerCodes.length > 0 ||
    item.latestDecision?.decision.toLowerCase() === "deferred"
  );
}
