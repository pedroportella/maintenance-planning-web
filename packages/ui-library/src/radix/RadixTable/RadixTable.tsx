import { Table } from "@radix-ui/themes";
import type { ComponentPropsWithoutRef } from "react";
import { joinClasses } from "../../components/shared";

type RadixTableThemeRootProps = ComponentPropsWithoutRef<typeof Table.Root>;

export type RadixTableRootProps = Omit<RadixTableThemeRootProps, "size"> & {
  density?: "compact" | "default";
  size?: RadixTableThemeRootProps["size"];
};

export function RadixTableRoot({
  className,
  density = "default",
  size,
  variant = "surface",
  ...tableProps
}: RadixTableRootProps) {
  return (
    <Table.Root
      className={joinClasses(
        "radix-table",
        density === "compact" && "radix-table-compact",
        className
      )}
      size={size ?? (density === "compact" ? "1" : "2")}
      variant={variant}
      {...tableProps}
    />
  );
}

export function RadixTableCaption({
  className,
  ...captionProps
}: ComponentPropsWithoutRef<"caption">) {
  return (
    <caption
      className={joinClasses("radix-table-caption", className)}
      {...captionProps}
    />
  );
}

export function RadixTableHeader({
  className,
  ...headerProps
}: ComponentPropsWithoutRef<typeof Table.Header>) {
  return (
    <Table.Header
      className={joinClasses("radix-table-header", className)}
      {...headerProps}
    />
  );
}

export function RadixTableBody({
  className,
  ...bodyProps
}: ComponentPropsWithoutRef<typeof Table.Body>) {
  return (
    <Table.Body
      className={joinClasses("radix-table-body", className)}
      {...bodyProps}
    />
  );
}

export function RadixTableRow({
  className,
  ...rowProps
}: ComponentPropsWithoutRef<typeof Table.Row>) {
  return (
    <Table.Row
      className={joinClasses("radix-table-row", className)}
      {...rowProps}
    />
  );
}

export function RadixTableColumnHeaderCell({
  className,
  ...cellProps
}: ComponentPropsWithoutRef<typeof Table.ColumnHeaderCell>) {
  return (
    <Table.ColumnHeaderCell
      className={joinClasses("radix-table-column-header-cell", className)}
      {...cellProps}
    />
  );
}

export function RadixTableRowHeaderCell({
  className,
  ...cellProps
}: ComponentPropsWithoutRef<typeof Table.RowHeaderCell>) {
  return (
    <Table.RowHeaderCell
      className={joinClasses("radix-table-row-header-cell", className)}
      {...cellProps}
    />
  );
}

export function RadixTableCell({
  className,
  ...cellProps
}: ComponentPropsWithoutRef<typeof Table.Cell>) {
  return (
    <Table.Cell
      className={joinClasses("radix-table-cell", className)}
      {...cellProps}
    />
  );
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
