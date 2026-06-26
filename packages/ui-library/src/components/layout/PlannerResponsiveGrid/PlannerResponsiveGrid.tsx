import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";

type PlannerResponsiveGridElement = "article" | "div" | "section";

export type PlannerResponsiveGridProps = {
  ariaLabel?: string;
  as?: PlannerResponsiveGridElement;
  balance?: "equal" | "primary" | "secondary";
  children: ReactNode;
  className?: string;
  collapseAt?: "standard" | "wide";
  columns?: "three" | "two";
  labelledBy?: string;
};

export function PlannerResponsiveGrid({
  ariaLabel,
  as = "div",
  balance = "equal",
  children,
  className,
  collapseAt = "standard",
  columns = "two",
  labelledBy
}: PlannerResponsiveGridProps) {
  const Component = as;

  return (
    <Component
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      className={joinClasses("planner-responsive-grid", className)}
      data-balance={balance}
      data-collapse-at={collapseAt}
      data-columns={columns}
    >
      {children}
    </Component>
  );
}
