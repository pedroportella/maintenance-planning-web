import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";
import { RadixText } from "../../radix";

export type PlannerTableCellStackProps = {
  className?: string;
  detail?: ReactNode;
  title: ReactNode;
};

export function PlannerTableCellStack({
  className,
  detail,
  title
}: PlannerTableCellStackProps) {
  return (
    <span className={joinClasses("planner-table-cell-stack", className)}>
      <RadixText
        as="span"
        className="planner-table-cell-stack-title"
        size="2"
        weight="bold"
      >
        {title}
      </RadixText>
      {detail ? (
        <RadixText
          as="span"
          className="planner-table-cell-stack-detail"
          size="1"
          tone="muted"
        >
          {detail}
        </RadixText>
      ) : null}
    </span>
  );
}
