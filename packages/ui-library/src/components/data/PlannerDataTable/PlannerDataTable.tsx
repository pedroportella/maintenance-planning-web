import { useId, type ReactNode } from "react";
import { PlannerEmptyState } from "../../feedback";
import { joinClasses } from "../../../utils";
import { RadixButton, RadixIcon, RadixTable } from "../../radix";

export type PlannerDataTableSortDirection = "ascending" | "descending";

export type PlannerDataTableSortState = {
  columnKey: string;
  direction: PlannerDataTableSortDirection;
};

export type PlannerDataTableColumn<TRow> = {
  align?: "end" | "start";
  className?: string;
  header: ReactNode;
  key: string;
  onSort?: () => void;
  render: (row: TRow) => ReactNode;
  rowHeader?: boolean;
  sortable?: boolean;
  sortLabel?: string;
};

export type PlannerDataTableProps<TRow> = {
  caption: string;
  className?: string;
  columns: readonly PlannerDataTableColumn<TRow>[];
  density?: "compact" | "default";
  description?: ReactNode;
  emptyState?: ReactNode;
  getRowKey: (row: TRow) => string;
  rows: readonly TRow[];
  sortState?: PlannerDataTableSortState;
};

export function PlannerDataTable<TRow>({
  caption,
  className,
  columns,
  density = "default",
  description,
  emptyState,
  getRowKey,
  rows,
  sortState
}: PlannerDataTableProps<TRow>) {
  const generatedId = useId().replace(/:/g, "");
  const captionId = `planner-data-table-${generatedId}-caption`;
  const descriptionId = description ? `planner-data-table-${generatedId}-description` : undefined;
  const fallbackEmptyState = (
    <PlannerEmptyState
      description="No rows are available for this local review state."
      title="No rows to show"
    />
  );
  const columnSpan = Math.max(columns.length, 1);

  return (
    <div
      className={joinClasses(
        "planner-data-table-region",
        "data-table-region",
        className
      )}
      aria-describedby={descriptionId}
      aria-labelledby={captionId}
      role="region"
      tabIndex={0}
    >
      {description ? (
        <p className="sr-only" id={descriptionId}>
          {description}
        </p>
      ) : null}
      <RadixTable.Root
        className={joinClasses(
          "planner-data-table",
          "data-table",
          density === "compact" && "data-table-compact"
        )}
        density={density}
      >
        <RadixTable.Caption className="planner-data-table-caption sr-only" id={captionId}>
          {caption}
        </RadixTable.Caption>
        <RadixTable.Header>
          <RadixTable.Row>
            {columns.map((column) => {
              const sortDirection =
                sortState?.columnKey === column.key ? sortState.direction : undefined;

              return (
                <RadixTable.ColumnHeaderCell
                  aria-sort={column.sortable || sortDirection ? sortDirection ?? "none" : undefined}
                  data-align={column.align ?? "start"}
                  data-sort-state={sortDirection ?? (column.sortable ? "none" : undefined)}
                  justify={column.align ?? "start"}
                  key={column.key}
                >
                  <PlannerDataTableHeaderContent
                    column={column}
                    sortDirection={sortDirection}
                  />
                </RadixTable.ColumnHeaderCell>
              );
            })}
          </RadixTable.Row>
        </RadixTable.Header>
        <RadixTable.Body>
          {rows.length > 0 ? (
            rows.map((row) => (
              <RadixTable.Row key={getRowKey(row)}>
                {columns.map((column) => {
                  const Cell = column.rowHeader ? RadixTable.RowHeaderCell : RadixTable.Cell;

                  return (
                    <Cell
                      className={column.className}
                      data-align={column.align ?? "start"}
                      justify={column.align ?? "start"}
                      key={column.key}
                    >
                      {column.render(row)}
                    </Cell>
                  );
                })}
              </RadixTable.Row>
            ))
          ) : (
            <RadixTable.Row>
              <RadixTable.Cell
                className="planner-data-table-empty-cell"
                colSpan={columnSpan}
              >
                <div className="planner-data-table-empty data-table-empty">
                  {emptyState ?? fallbackEmptyState}
                </div>
              </RadixTable.Cell>
            </RadixTable.Row>
          )}
        </RadixTable.Body>
      </RadixTable.Root>
    </div>
  );
}

function PlannerDataTableHeaderContent<TRow>({
  column,
  sortDirection
}: {
  readonly column: PlannerDataTableColumn<TRow>;
  readonly sortDirection?: PlannerDataTableSortDirection;
}) {
  if (!column.sortable && !column.onSort) {
    return <>{column.header}</>;
  }

  const sortLabel =
    column.sortLabel ??
    (typeof column.header === "string" ? `Sort by ${column.header}` : "Sort table column");
  const iconName = sortDirection === "ascending" ? "caretUp" : "caretDown";
  const sortDescription = getSortDescription(sortLabel, sortDirection);

  if (!column.onSort) {
    return (
      <span className="planner-data-table-sort-label">
        <span>{column.header}</span>
        <span className="sr-only"> {sortDescription}</span>
        <RadixIcon
          className="planner-data-table-sort-icon"
          decorative
          name={iconName}
        />
      </span>
    );
  }

  return (
    <RadixButton
      className="planner-data-table-sort-button"
      onClick={column.onSort}
      tone="neutral"
      variant="ghost"
    >
      <span>{column.header}</span>
      <span className="sr-only"> {sortDescription}</span>
      <RadixIcon
        className="planner-data-table-sort-icon"
        decorative
        name={iconName}
      />
    </RadixButton>
  );
}

function getSortDescription(
  sortLabel: string,
  sortDirection?: PlannerDataTableSortDirection
) {
  if (!sortDirection) {
    return `${sortLabel}. Not sorted. Activate to sort ascending.`;
  }

  const nextDirection = sortDirection === "ascending" ? "descending" : "ascending";

  return `${sortLabel}. Sorted ${sortDirection}. Activate to sort ${nextDirection}.`;
}
