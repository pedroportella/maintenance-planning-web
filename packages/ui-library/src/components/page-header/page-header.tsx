import type { ReactNode } from "react";
import { joinClasses } from "../shared";

export type PageHeaderProps = {
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: string;
  title: string;
};

export function PageHeader({
  actions,
  badge,
  className,
  description,
  eyebrow,
  title
}: PageHeaderProps) {
  return (
    <header className={joinClasses("page-header", className)}>
      <div className="page-header-copy">
        {badge ? <div className="page-header-badge">{badge}</div> : null}
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  );
}
