import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";
import type { PlannerStatusTone } from "../../feedback";
import {
  RadixDataList,
  RadixText,
  type RadixDataListRootProps
} from "../../radix";

export type PlannerSummaryListItem = {
  detail?: ReactNode;
  id?: string;
  label: ReactNode;
  tone?: PlannerStatusTone;
  value: ReactNode;
};

export type PlannerSummaryListProps = {
  ariaLabel?: string;
  className?: string;
  items: readonly PlannerSummaryListItem[];
  orientation?: RadixDataListRootProps["orientation"];
  size?: RadixDataListRootProps["size"];
  variant?: "compact" | "standard";
};

function getSummaryItemKey(item: PlannerSummaryListItem, index: number) {
  if (item.id) {
    return item.id;
  }

  return typeof item.label === "string" ? item.label : `summary-item-${index}`;
}

export function PlannerSummaryList({
  ariaLabel,
  className,
  items,
  orientation = "horizontal",
  size,
  variant = "standard"
}: PlannerSummaryListProps) {
  const resolvedSize = size ?? (variant === "compact" ? "1" : "2");

  return (
    <RadixDataList.Root
      aria-label={ariaLabel}
      className={joinClasses(
        "planner-summary-list",
        `planner-summary-list-${variant}`,
        className
      )}
      data-variant={variant}
      orientation={orientation}
      size={resolvedSize}
    >
      {items.map((item, index) => (
        <RadixDataList.Item
          className="planner-summary-list-item"
          data-tone={item.tone ?? "neutral"}
          key={getSummaryItemKey(item, index)}
        >
          <RadixDataList.Label className="planner-summary-list-label">
            {item.label}
          </RadixDataList.Label>
          <RadixDataList.Value className="planner-summary-list-value">
            <span className="planner-summary-list-value-content">
              <RadixText
                as="span"
                className="planner-summary-list-value-text"
                size={variant === "compact" ? "2" : "3"}
                tone={item.tone ?? "default"}
                weight="medium"
              >
                {item.value}
              </RadixText>
              {item.detail ? (
                <RadixText
                  as="span"
                  className="planner-summary-list-detail"
                  size="1"
                  tone="muted"
                >
                  {item.detail}
                </RadixText>
              ) : null}
            </span>
          </RadixDataList.Value>
        </RadixDataList.Item>
      ))}
    </RadixDataList.Root>
  );
}
