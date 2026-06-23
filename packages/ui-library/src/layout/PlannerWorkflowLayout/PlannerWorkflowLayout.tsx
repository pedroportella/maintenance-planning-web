import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";

export type PlannerWorkflowLayoutProps = {
  actions?: ReactNode;
  backLink?: ReactNode;
  children: ReactNode;
  className?: string;
  contextLabel?: ReactNode;
  lead?: ReactNode;
  progress?: ReactNode;
  title: ReactNode;
  titleId?: string;
};

export function PlannerWorkflowLayout({
  actions,
  backLink,
  children,
  className,
  contextLabel,
  lead,
  progress,
  title,
  titleId
}: PlannerWorkflowLayoutProps) {
  return (
    <section
      aria-labelledby={titleId}
      className={joinClasses("planner-workflow-layout", className)}
    >
      {progress ? <div className="planner-workflow-layout-progress">{progress}</div> : null}
      {backLink ? <div className="planner-workflow-layout-back">{backLink}</div> : null}
      <header className="planner-workflow-layout-header">
        {contextLabel ? (
          <p className="planner-workflow-layout-context">{contextLabel}</p>
        ) : null}
        <h1 id={titleId}>{title}</h1>
        {lead ? <p className="planner-workflow-layout-lead">{lead}</p> : null}
      </header>
      <div className="planner-workflow-layout-body">{children}</div>
      {actions ? <footer className="planner-workflow-layout-actions">{actions}</footer> : null}
    </section>
  );
}
