"use client";

import { useMemo, useState } from "react";
import {
  PlannerBadgeGroup,
  PlannerDataTable,
  PlannerEmptyState,
  PlannerFilterToolbar,
  PlannerPagination,
  PlannerStatusBadge,
  PlannerTableCellStack,
  type PlannerDataTableColumn,
  type PlannerDataTableSortDirection,
  type PlannerSegmentedNavOption
} from "@maintenance-planning/ui-library";
import type { WorkOrderBacklogItem } from "@maintenance-planning/services";
import Link from "next/link";
import { packageRecommendationHref } from "@/containers/recommendations/recommendation-links";
import {
  formatBacklogResultSummary,
  formatHours,
  formatUtc,
  latestDecisionText,
  toneForDecision,
  workOrderStateBadgeSpecs,
  workOrderIssueText
} from "@/lib/planner-format";

type WorkOrderBacklogTableProps = {
  filterLabel: string;
  filterOptions: readonly PlannerSegmentedNavOption[];
  items: readonly WorkOrderBacklogItem[];
  planningRunId: string;
};

type WorkOrderBacklogSortKey = "due" | "hours" | "readiness" | "work-order";

type WorkOrderBacklogSortState = {
  columnKey: WorkOrderBacklogSortKey;
  direction: PlannerDataTableSortDirection;
};

const pageSize = 4;
const defaultSortState: WorkOrderBacklogSortState = {
  columnKey: "due",
  direction: "ascending"
};

export function WorkOrderBacklogTable({
  filterLabel,
  filterOptions,
  items,
  planningRunId
}: WorkOrderBacklogTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortState, setSortState] =
    useState<WorkOrderBacklogSortState>(defaultSortState);
  const [currentPage, setCurrentPage] = useState(1);

  const searchedItems = useMemo(
    () => filterBySearch(items, searchQuery),
    [items, searchQuery]
  );
  const sortedItems = useMemo(
    () => sortWorkOrders(searchedItems, sortState),
    [searchedItems, sortState]
  );
  const pageCount = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const pageRows = sortedItems.slice((safePage - 1) * pageSize, safePage * pageSize);
  const backlogColumns = useMemo(
    () => buildBacklogColumns(planningRunId, sortState, setSortState),
    [planningRunId, sortState]
  );
  const hasActiveLocalControls =
    searchQuery.length > 0 ||
    sortState.columnKey !== defaultSortState.columnKey ||
    sortState.direction !== defaultSortState.direction ||
    safePage !== 1;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const resetLocalControls = () => {
    setSearchQuery("");
    setSortState(defaultSortState);
    setCurrentPage(1);
  };

  return (
    <>
      <PlannerFilterToolbar
        ariaLabel="Work-order table controls"
        clearAction={{
          disabled: !hasActiveLocalControls,
          label: "Reset controls",
          onClear: resetLocalControls
        }}
        filters={[
          {
            ariaLabel: "Work-order triage filters",
            kind: "links",
            options: filterOptions
          }
        ]}
        resultSummary={
          <>
            {formatBacklogResultSummary({
              baseRowCount: items.length,
              filterLabel,
              hasSearchQuery: searchQuery.trim().length > 0,
              searchMatchCount: searchedItems.length,
              visibleRowCount: pageRows.length
            })}
            <span className="sr-only">
              . {formatSortState(sortState)}. Page {safePage} of {pageCount}.
            </span>
          </>
        }
        search={{
          clearLabel: "Clear search",
          id: "work-order-table-search",
          label: "Search work orders",
          onChange: handleSearchChange,
          onClear: () => handleSearchChange(""),
          placeholder: "Search work order, package or issue",
          value: searchQuery
        }}
      />
      <PlannerDataTable
        caption="Planner work-order triage"
        columns={backlogColumns}
        density="compact"
        description={`Use the work-order row header, planning state, coordination note, package, hours, due date and latest decision columns to triage ${filterLabel.toLowerCase()} work orders. Horizontal scrolling is limited to this table region on narrow screens.`}
        emptyState={
          <PlannerEmptyState
            description={
              searchQuery
                ? `No work orders match "${searchQuery}" within the ${filterLabel.toLowerCase()} filter.`
                : `The service returned no work orders for the ${filterLabel.toLowerCase()} filter.`
            }
            title="No work orders"
          />
        }
        getRowKey={(item) => item.id}
        rows={pageRows}
        sortState={sortState}
      />
      <PlannerPagination
        ariaLabel="Work-order triage pagination"
        currentPage={safePage}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalItems={sortedItems.length}
      />
    </>
  );
}

function buildBacklogColumns(
  planningRunId: string,
  sortState: WorkOrderBacklogSortState,
  setSortState: (state: WorkOrderBacklogSortState) => void
): readonly PlannerDataTableColumn<WorkOrderBacklogItem>[] {
  const sortColumn = (columnKey: WorkOrderBacklogSortKey) => {
    setSortState(nextSortState(sortState, columnKey));
  };

  return [
    {
      header: "Work order",
      key: "work-order",
      onSort: () => sortColumn("work-order"),
      render: (item) => (
        <PlannerTableCellStack detail={item.title} title={item.workOrderNumber} />
      ),
      rowHeader: true,
      sortLabel: "Sort by work order",
      sortable: true
    },
    {
      header: "Planning state",
      key: "readiness",
      onSort: () => sortColumn("readiness"),
      render: (item) => (
        <PlannerBadgeGroup>
          {workOrderStateBadgeSpecs(item).map((badge) => (
            <PlannerStatusBadge key={badge.id} tone={badge.tone}>
              {badge.label}
            </PlannerStatusBadge>
          ))}
        </PlannerBadgeGroup>
      ),
      sortLabel: "Sort by planning state",
      sortable: true
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
        <PlannerTableCellStack
          detail={
            <Link href={packageRecommendationHref(item.packageId, { planningRunId })}>
              Open package
              <span className="sr-only"> {item.packageNumber}</span>
            </Link>
          }
          title={item.packageNumber}
        />
      )
    },
    {
      align: "end",
      header: "Hours",
      key: "hours",
      onSort: () => sortColumn("hours"),
      render: (item) => formatHours(item.estimatedHours),
      sortLabel: "Sort by estimated hours",
      sortable: true
    },
    {
      align: "end",
      header: "Due",
      key: "due",
      onSort: () => sortColumn("due"),
      render: (item) => formatUtc(item.dueAtUtc),
      sortLabel: "Sort by due date",
      sortable: true
    },
    {
      header: "Latest decision",
      key: "decision",
      render: (item) => (
        <PlannerStatusBadge tone={toneForDecision(item.latestDecision?.decision)}>
          {latestDecisionText(item.latestDecision)}
        </PlannerStatusBadge>
      )
    }
  ];
}

function nextSortState(
  current: WorkOrderBacklogSortState,
  columnKey: WorkOrderBacklogSortKey
): WorkOrderBacklogSortState {
  if (current.columnKey !== columnKey) {
    return {
      columnKey,
      direction: "ascending"
    };
  }

  return {
    columnKey,
    direction: current.direction === "ascending" ? "descending" : "ascending"
  };
}

function formatSortState(sortState: WorkOrderBacklogSortState) {
  const labelByKey = {
    due: "due date",
    hours: "estimated hours",
    readiness: "planning state",
    "work-order": "work order"
  } as const satisfies Record<WorkOrderBacklogSortKey, string>;

  return `Sorted by ${labelByKey[sortState.columnKey]} ${sortState.direction}`;
}

function filterBySearch(
  items: readonly WorkOrderBacklogItem[],
  searchQuery: string
): readonly WorkOrderBacklogItem[] {
  const query = searchQuery.trim().toLowerCase();

  if (!query) return items;

  return items.filter((item) =>
    [
      item.workOrderNumber,
      item.title,
      item.packageNumber,
      item.packageTitle,
      item.readinessIssueCode,
      item.readinessIssueDetail,
      item.blockerCodes.join(" "),
      latestDecisionText(item.latestDecision)
    ]
      .filter((value): value is string => typeof value === "string")
      .some((value) => value.toLowerCase().includes(query))
  );
}

function sortWorkOrders(
  items: readonly WorkOrderBacklogItem[],
  sortState: WorkOrderBacklogSortState
): readonly WorkOrderBacklogItem[] {
  const sorted = [...items].sort((left, right) => {
    if (sortState.columnKey === "hours") {
      return compareNumbers(left.estimatedHours, right.estimatedHours);
    }

    if (sortState.columnKey === "due") {
      return compareNumbers(toTime(left.dueAtUtc), toTime(right.dueAtUtc));
    }

    if (sortState.columnKey === "readiness") {
      return compareText(
        `${left.readinessStatus} ${left.plannerState}`,
        `${right.readinessStatus} ${right.plannerState}`
      );
    }

    return compareText(left.workOrderNumber, right.workOrderNumber);
  });

  return sortState.direction === "ascending" ? sorted : sorted.reverse();
}

function compareNumbers(
  left: number | null | undefined,
  right: number | null | undefined
): number {
  const leftValue = typeof left === "number" ? left : Number.POSITIVE_INFINITY;
  const rightValue = typeof right === "number" ? right : Number.POSITIVE_INFINITY;

  return leftValue - rightValue;
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, undefined, {
    sensitivity: "base"
  });
}

function toTime(value: string | null | undefined): number | null {
  if (!value) return null;

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}
