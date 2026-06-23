import type { ReactNode } from "react";
import { EmptyState } from "../../components/empty-state/empty-state";
import { joinClasses } from "../../components/shared";
import { RadixTable } from "../../radix/RadixTable";

export type PlannerDataTableColumn<TRow> = {
  align?: "end" | "start";
  className?: string;
  header: ReactNode;
  key: string;
  render: (row: TRow) => ReactNode;
  rowHeader?: boolean;
};

export type PlannerDataTableProps<TRow> = {
  caption: string;
  className?: string;
  columns: readonly PlannerDataTableColumn<TRow>[];
  density?: "compact" | "default";
  emptyState?: ReactNode;
  getRowKey: (row: TRow) => string;
  rows: readonly TRow[];
};

export function PlannerDataTable<TRow>({
  caption,
  className,
  columns,
  density = "default",
  emptyState,
  getRowKey,
  rows
}: PlannerDataTableProps<TRow>) {
  const fallbackEmptyState = (
    <EmptyState
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
    >
      <RadixTable.Root
        className={joinClasses(
          "planner-data-table",
          "data-table",
          density === "compact" && "data-table-compact"
        )}
        density={density}
      >
        <RadixTable.Caption className="planner-data-table-caption sr-only">
          {caption}
        </RadixTable.Caption>
        <RadixTable.Header>
          <RadixTable.Row>
            {columns.map((column) => (
              <RadixTable.ColumnHeaderCell
                data-align={column.align ?? "start"}
                justify={column.align ?? "start"}
                key={column.key}
              >
                {column.header}
              </RadixTable.ColumnHeaderCell>
            ))}
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
