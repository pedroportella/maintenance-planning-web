import type { ReactNode } from "react";
import { EmptyState } from "../empty-state/empty-state";
import { joinClasses } from "../shared";

export type DataTableColumn<TRow> = {
  align?: "end" | "start";
  className?: string;
  header: ReactNode;
  key: string;
  render: (row: TRow) => ReactNode;
};

export type DataTableProps<TRow> = {
  caption: string;
  className?: string;
  columns: readonly DataTableColumn<TRow>[];
  emptyState?: ReactNode;
  getRowKey: (row: TRow) => string;
  rows: readonly TRow[];
};

export function DataTable<TRow>({
  caption,
  className,
  columns,
  emptyState,
  getRowKey,
  rows
}: DataTableProps<TRow>) {
  const fallbackEmptyState = (
    <EmptyState
      description="No rows are available for this local review state."
      title="No rows to show"
    />
  );

  return (
    <div className={joinClasses("data-table-region", className)}>
      <div className="data-table-scroll">
        <table className="data-table">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th data-align={column.align ?? "start"} key={column.key} scope="col">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={getRowKey(row)}>
                  {columns.map((column) => (
                    <td
                      className={column.className}
                      data-align={column.align ?? "start"}
                      key={column.key}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="data-table-empty">{emptyState ?? fallbackEmptyState}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
