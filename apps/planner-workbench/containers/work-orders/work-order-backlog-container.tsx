import {
  Alert,
  DataTable,
  EmptyState,
  MetricSummary,
  PageHeader,
  QuietNote,
  SegmentedNav,
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

type WorkOrderFilter = "all" | "deferred" | "exceptions" | "ready";

type WorkOrderBacklogPageProps = {
  initialFilter?: WorkOrderFilter;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function buildBacklogColumns(
  planningRunId: string
): readonly DataTableColumn<WorkOrderBacklogItem>[] {
  return [
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
        <span className="table-stack">
          <strong>{item.packageNumber}</strong>
          <Link
            className="table-link"
            href={packageRecommendationHref(item.packageId, { planningRunId })}
          >
            Open package
            <span className="sr-only"> {item.packageNumber}</span>
          </Link>
        </span>
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
}

export default async function WorkOrderBacklogPage({
  initialFilter,
  searchParams
}: WorkOrderBacklogPageProps = {}) {
  const backlogSection = getWorkbenchSection("work-order-backlog");
  const exceptionsSection = getWorkbenchSection("coordination-exceptions");

  try {
    const services = createPlannerServices();
    const runtime = services.getRuntimeInfo();
    const backlog = await services.getWorkOrderBacklog();
    const params = (await searchParams) ?? {};
    const selectedFilter = initialFilter ?? readWorkOrderFilter(params);
    const exceptionItems = backlog.items.filter(isCoordinationException);
    const filteredItems = filterWorkOrders(backlog.items, selectedFilter);
    const section = selectedFilter === "exceptions" ? exceptionsSection : backlogSection;
    const filterOptions = buildFilterOptions(selectedFilter, backlog.items, exceptionItems);
    const backlogColumns = buildBacklogColumns(backlog.planningRunId);

    return (
      <main className="page-stack">
        <PageHeader
          badge={
            <span className="badge-stack">
              <StatusBadge tone={exceptionItems.length > 0 ? "warning" : "success"}>
                {exceptionItems.length} exceptions
              </StatusBadge>
              <StatusBadge tone="neutral">{runtime.mode} mode</StatusBadge>
            </span>
          }
          description="Filter imported synthetic work orders by readiness, exception state and planner decision before opening the related package."
          title={section.label}
        />

        <MetricSummary
          ariaLabel="Work-order triage summary"
          items={buildBacklogMetrics(backlog)}
          variant="compact"
        />

        <div className="console-toolbar">
          <SegmentedNav ariaLabel="Work-order triage filters" options={filterOptions} />
          <StatusBadge tone="neutral">{filteredItems.length} shown</StatusBadge>
        </div>

        {exceptionItems.length > 0 ? (
          <Alert title="Exceptions need review" tone="warning">
            <p>
              {exceptionItems.length} synthetic work order
              {exceptionItems.length === 1 ? "" : "s"} need coordination before planning can move
              cleanly.
            </p>
          </Alert>
        ) : (
          <QuietNote title="Planner inbox scope">
            No coordination exceptions are present in this synthetic backlog response.
          </QuietNote>
        )}

        <WorkbenchPanel className="console-panel" labelledBy="backlog-table">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Imported work orders</p>
              <h2 id="backlog-table">Planner triage</h2>
            </div>
            <StatusBadge tone="neutral">Generated {formatUtc(backlog.generatedAtUtc)}</StatusBadge>
          </div>
          <DataTable
            caption="Planner work-order triage"
            columns={backlogColumns}
            density="compact"
            emptyState={
              <EmptyState
                description={`The service returned no work orders for the ${filterLabel(selectedFilter).toLowerCase()} filter.`}
                title="No work orders"
              />
            }
            getRowKey={(item) => item.id}
            rows={filteredItems}
          />
        </WorkbenchPanel>
      </main>
    );
  } catch (error) {
    return (
      <PlannerRouteFailure
        description="The backlog route reads from the planner service boundary and keeps source-system-shaped review data server-side."
        error={error}
        title={backlogSection.label}
      />
    );
  }
}

export function isCoordinationException(item: WorkOrderBacklogItem): boolean {
  return (
    item.readinessStatus !== "ready" ||
    item.plannerState !== "ready" ||
    item.blockerCodes.length > 0 ||
    item.latestDecision?.decision.toLowerCase() === "deferred"
  );
}

function readWorkOrderFilter(
  params: Record<string, string | string[] | undefined>
): WorkOrderFilter {
  const value = params.filter;
  const filter = Array.isArray(value) ? value[0] : value;

  if (filter === "deferred" || filter === "exceptions" || filter === "ready") {
    return filter;
  }

  return "all";
}

function filterWorkOrders(
  items: readonly WorkOrderBacklogItem[],
  filter: WorkOrderFilter
): readonly WorkOrderBacklogItem[] {
  if (filter === "exceptions") return items.filter(isCoordinationException);
  if (filter === "ready") {
    return items.filter((item) => item.readinessStatus === "ready" && item.plannerState === "ready");
  }
  if (filter === "deferred") {
    return items.filter((item) => item.latestDecision?.decision.toLowerCase() === "deferred");
  }

  return items;
}

function buildFilterOptions(
  selectedFilter: WorkOrderFilter,
  items: readonly WorkOrderBacklogItem[],
  exceptionItems: readonly WorkOrderBacklogItem[]
) {
  const readyCount = filterWorkOrders(items, "ready").length;
  const deferredCount = filterWorkOrders(items, "deferred").length;

  return [
    {
      href: "/work-order-backlog",
      label: `All (${items.length})`,
      selected: selectedFilter === "all"
    },
    {
      href: "/coordination-exceptions",
      label: `Exceptions (${exceptionItems.length})`,
      selected: selectedFilter === "exceptions"
    },
    {
      href: "/work-order-backlog?filter=ready",
      label: `Ready (${readyCount})`,
      selected: selectedFilter === "ready"
    },
    {
      href: "/work-order-backlog?filter=deferred",
      label: `Deferred (${deferredCount})`,
      selected: selectedFilter === "deferred"
    }
  ];
}

function filterLabel(filter: WorkOrderFilter): string {
  if (filter === "deferred") return "Deferred";
  if (filter === "exceptions") return "Exceptions";
  if (filter === "ready") return "Ready";
  return "All";
}
