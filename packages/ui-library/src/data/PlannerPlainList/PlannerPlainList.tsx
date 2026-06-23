import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";

export type PlannerPlainListProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
};

export function PlannerPlainList({
  ariaLabel,
  children,
  className
}: PlannerPlainListProps) {
  return (
    <ul
      aria-label={ariaLabel}
      className={joinClasses("planner-plain-list", className)}
    >
      {children}
    </ul>
  );
}
