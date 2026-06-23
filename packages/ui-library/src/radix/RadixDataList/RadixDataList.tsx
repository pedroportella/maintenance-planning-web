import { DataList } from "@radix-ui/themes";
import type { ComponentPropsWithoutRef } from "react";
import { joinClasses } from "../../components/shared";

export type RadixDataListRootProps = ComponentPropsWithoutRef<typeof DataList.Root>;
export type RadixDataListItemProps = ComponentPropsWithoutRef<typeof DataList.Item>;
export type RadixDataListLabelProps = ComponentPropsWithoutRef<typeof DataList.Label>;
export type RadixDataListValueProps = ComponentPropsWithoutRef<typeof DataList.Value>;

export function RadixDataListRoot({
  className,
  ...dataListProps
}: RadixDataListRootProps) {
  return (
    <DataList.Root
      className={joinClasses("radix-data-list", className)}
      {...dataListProps}
    />
  );
}

export function RadixDataListItem({
  className,
  ...itemProps
}: RadixDataListItemProps) {
  return (
    <DataList.Item
      className={joinClasses("radix-data-list-item", className)}
      {...itemProps}
    />
  );
}

export function RadixDataListLabel({
  className,
  ...labelProps
}: RadixDataListLabelProps) {
  return (
    <DataList.Label
      className={joinClasses("radix-data-list-label", className)}
      {...labelProps}
    />
  );
}

export function RadixDataListValue({
  className,
  ...valueProps
}: RadixDataListValueProps) {
  return (
    <DataList.Value
      className={joinClasses("radix-data-list-value", className)}
      {...valueProps}
    />
  );
}

export const RadixDataList = {
  Item: RadixDataListItem,
  Label: RadixDataListLabel,
  Root: RadixDataListRoot,
  Value: RadixDataListValue
} as const;
