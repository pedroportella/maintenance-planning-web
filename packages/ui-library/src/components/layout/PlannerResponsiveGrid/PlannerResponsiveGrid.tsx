import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";

type PlannerResponsiveGridElement = "article" | "div" | "section";

export type PlannerResponsiveGridProps = {
  ariaLabel?: string;
  as?: PlannerResponsiveGridElement;
  balance?: "equal" | "primary" | "secondary";
  children: ReactNode;
  className?: string;
  columns?: "three" | "two";
  labelledBy?: string;
};

export function PlannerResponsiveGrid({
  ariaLabel,
  as = "div",
  balance = "equal",
  children,
  className,
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
      data-columns={columns}
    >
      {children}
    </Component>
  );
}
