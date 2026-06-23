import type {
  DataTableColumn,
  DataTableProps
} from "../../components/data-table/data-table";
import { DataTable } from "../../components/data-table/data-table";

export type PlannerDataTableColumn<TRow> = DataTableColumn<TRow>;
export type PlannerDataTableProps<TRow> = DataTableProps<TRow>;

export function PlannerDataTable<TRow>(props: PlannerDataTableProps<TRow>) {
  return <DataTable {...props} />;
}
