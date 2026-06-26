import {
  PlannerContentSection,
  PlannerDataTable,
  PlannerEmptyState,
  PlannerFilterToolbar,
  PlannerPagination,
  PlannerStatusBadge
} from "@maintenance-planning/ui-library";
import type {
  OperationsPostureView,
  WorkOrderBacklogView
} from "@maintenance-planning/services";
import {
  controlledWorkOrderColumns,
  overflowingWorkOrderColumns,
  signalColumns,
  workOrderColumns
} from "./showcase-fixtures";

export function TablesSection({
  backlog,
  posture
}: {
  readonly backlog: WorkOrderBacklogView;
  readonly posture: OperationsPostureView;
}) {
  return (
    <PlannerContentSection
      badge={<PlannerStatusBadge tone="warning">Scrollable on small screens</PlannerStatusBadge>}
      eyebrow="Component family"
      title="Tables and row states"
      titleId="showcase-tables"
      variant="surface"
    >
      <PlannerDataTable
        caption="UI showcase work-order rows"
        columns={workOrderColumns}
        getRowKey={(item) => item.id}
        rows={backlog.items}
      />
      <PlannerFilterToolbar
        ariaLabel="Showcase table controls"
        clearAction={{
          disabled: true,
          label: "Reset controls"
        }}
        filters={[
          {
            ariaLabel: "Showcase work-order filters",
            kind: "links",
            options: [
              {
                href: "/ui-library",
                label: `All (${backlog.items.length})`,
                selected: true
              },
              {
                href: "/ui-library?filter=ready",
                label: "Ready"
              },
              {
                href: "/ui-library?filter=exceptions",
                label: "Exceptions"
              }
            ]
          }
        ]}
        resultSummary={`Showing ${Math.min(4, backlog.items.length)} of ${backlog.items.length} rows`}
        search={{
          id: "showcase-table-search",
          label: "Search work orders",
          placeholder: "Search work order, package or issue",
          readOnly: true,
          value: "pump"
        }}
      />
      <PlannerDataTable
        caption="UI showcase controlled work-order table"
        columns={controlledWorkOrderColumns}
        density="compact"
        getRowKey={(item) => item.id}
        rows={backlog.items.slice(0, 4)}
        sortState={{
          columnKey: "due",
          direction: "ascending"
        }}
      />
      <PlannerPagination
        currentPage={1}
        hrefForPage={(page) => `/ui-library?page=${page}`}
        pageSize={4}
        totalItems={backlog.items.length}
      />
      <PlannerDataTable
        caption="UI showcase empty table"
        columns={workOrderColumns}
        emptyState={
          <PlannerEmptyState
            description="The table shell stays stable when a filtered synthetic review state has no rows."
            title="No matching rows"
          />
        }
        getRowKey={(item) => item.id}
        rows={[]}
      />
      <PlannerDataTable
        caption="UI showcase compact operations signals"
        columns={signalColumns}
        density="compact"
        getRowKey={(signal) => signal.label}
        rows={posture.signals}
      />
      <PlannerDataTable
        caption="UI showcase horizontally overflowing work-order rows"
        columns={overflowingWorkOrderColumns}
        getRowKey={(item) => item.id}
        rows={backlog.items}
      />
    </PlannerContentSection>
  );
}
