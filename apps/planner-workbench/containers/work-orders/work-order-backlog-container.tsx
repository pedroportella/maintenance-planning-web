import {
  Alert,
  MetricSummary,
  PageHeader,
  QuietNote,
  StatusBadge,
  WorkbenchPanel
} from "@maintenance-planning/ui-library";
import {
  createPlannerServices,
  type WorkOrderBacklogItem
} from "@maintenance-planning/services";
import { getWorkbenchSection } from "@maintenance-planning/utils";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import {
  buildBacklogMetrics,
  formatUtc,
} from "@/lib/planner-format";
import { WorkOrderBacklogTable } from "./work-order-backlog-table";

type WorkOrderFilter = "all" | "deferred" | "exceptions" | "ready";

type WorkOrderBacklogPageProps = {
  initialFilter?: WorkOrderFilter;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

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
          <WorkOrderBacklogTable
            filterLabel={filterLabel(selectedFilter)}
            filterOptions={filterOptions}
            items={filteredItems}
            planningRunId={backlog.planningRunId}
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
