import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";

export type PlannerPageProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
  width?: "default" | "narrow" | "wide";
};

export function PlannerPage({
  children,
  className,
  id = "planner-main",
  labelledBy,
  width = "wide"
}: PlannerPageProps) {
  return (
    <main
      aria-labelledby={labelledBy}
      className={joinClasses("planner-page", className)}
      data-width={width}
      id={id}
      tabIndex={-1}
    >
      {children}
    </main>
  );
}
