import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";

export type PlannerPageHeaderProps = {
  actions?: ReactNode;
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  titleId?: string;
};

export function PlannerPageHeader({
  actions,
  badge,
  children,
  className,
  description,
  eyebrow,
  title,
  titleId
}: PlannerPageHeaderProps) {
  return (
    <header className={joinClasses("planner-page-header", className)}>
      <div className="planner-page-header-copy">
        {badge ? <div className="planner-page-header-badge">{badge}</div> : null}
        {eyebrow ? <p className="planner-page-header-eyebrow">{eyebrow}</p> : null}
        <h1 id={titleId}>{title}</h1>
        {description ? <p className="planner-page-header-description">{description}</p> : null}
        {children}
      </div>
      {actions ? <div className="planner-page-header-actions">{actions}</div> : null}
    </header>
  );
}
