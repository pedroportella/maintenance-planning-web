import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";

type PlannerContentSectionElement = "article" | "div" | "section";

export type PlannerContentSectionProps = {
  actions?: ReactNode;
  as?: PlannerContentSectionElement;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  labelledBy?: string;
  title?: ReactNode;
  titleId?: string;
  variant?: "plain" | "surface";
};

export function PlannerContentSection({
  actions,
  as = "section",
  badge,
  children,
  className,
  description,
  eyebrow,
  labelledBy,
  title,
  titleId,
  variant = "plain"
}: PlannerContentSectionProps) {
  const Component = as;
  const headingId = titleId ?? labelledBy;
  const hasHeader = Boolean(title || description || eyebrow || badge || actions);

  return (
    <Component
      aria-labelledby={headingId}
      className={joinClasses("planner-content-section", className)}
      data-variant={variant}
    >
      {hasHeader ? (
        <header className="planner-content-section-header">
          <div className="planner-content-section-copy">
            {eyebrow ? <p className="planner-content-section-eyebrow">{eyebrow}</p> : null}
            {title ? <h2 id={headingId}>{title}</h2> : null}
            {description ? (
              <p className="planner-content-section-description">{description}</p>
            ) : null}
          </div>
          {badge || actions ? (
            <div className="planner-content-section-actions">
              {badge}
              {actions}
            </div>
          ) : null}
        </header>
      ) : null}
      <div className="planner-content-section-body">{children}</div>
    </Component>
  );
}
