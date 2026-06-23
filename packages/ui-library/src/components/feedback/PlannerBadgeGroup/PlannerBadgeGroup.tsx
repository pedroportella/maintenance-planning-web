import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";

type PlannerBadgeGroupElement = "div" | "section" | "span";

export type PlannerBadgeGroupProps = {
  align?: "end" | "start";
  ariaLabel?: string;
  as?: PlannerBadgeGroupElement;
  children: ReactNode;
  className?: string;
};

export function PlannerBadgeGroup({
  align = "start",
  ariaLabel,
  as = "span",
  children,
  className
}: PlannerBadgeGroupProps) {
  const Component = as;

  return (
    <Component
      aria-label={ariaLabel}
      className={joinClasses("planner-badge-group", className)}
      data-align={align}
    >
      {children}
    </Component>
  );
}
