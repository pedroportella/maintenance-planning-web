import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";

export type PlannerPageProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
};

export function PlannerPage({ children, className, id, labelledBy }: PlannerPageProps) {
  return (
    <main aria-labelledby={labelledBy} className={joinClasses("planner-page", className)} id={id}>
      {children}
    </main>
  );
}
