import type { ComponentPropsWithoutRef } from "react";
import { joinClasses } from "../../components/shared";

export type RadixTableRootProps = ComponentPropsWithoutRef<"table"> & {
  density?: "compact" | "default";
};

export function RadixTableRoot({
  className,
  density = "default",
  ...tableProps
}: RadixTableRootProps) {
  return (
    <table
      className={joinClasses(
        "radix-table",
        density === "compact" && "radix-table-compact",
        className
      )}
      {...tableProps}
    />
  );
}

export function RadixTableCaption(props: ComponentPropsWithoutRef<"caption">) {
  return <caption {...props} />;
}

export function RadixTableHeader(props: ComponentPropsWithoutRef<"thead">) {
  return <thead {...props} />;
}

export function RadixTableBody(props: ComponentPropsWithoutRef<"tbody">) {
  return <tbody {...props} />;
}

export function RadixTableRow(props: ComponentPropsWithoutRef<"tr">) {
  return <tr {...props} />;
}

export function RadixTableColumnHeaderCell(props: ComponentPropsWithoutRef<"th">) {
  return <th scope="col" {...props} />;
}

export function RadixTableRowHeaderCell(props: ComponentPropsWithoutRef<"th">) {
  return <th scope="row" {...props} />;
}

export function RadixTableCell(props: ComponentPropsWithoutRef<"td">) {
  return <td {...props} />;
}

export const RadixTable = {
  Body: RadixTableBody,
  Caption: RadixTableCaption,
  Cell: RadixTableCell,
  ColumnHeaderCell: RadixTableColumnHeaderCell,
  Header: RadixTableHeader,
  Root: RadixTableRoot,
  Row: RadixTableRow,
  RowHeaderCell: RadixTableRowHeaderCell
} as const;
