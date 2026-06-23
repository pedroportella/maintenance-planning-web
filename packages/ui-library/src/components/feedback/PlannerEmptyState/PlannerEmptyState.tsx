import type { AriaRole, ReactNode } from "react";
import type { PlannerStatusTone } from "../PlannerStatusBadge";
import { joinClasses } from "../../../utils";
import { RadixHeading, RadixIcon, RadixText } from "../../radix";

export type PlannerEmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  icon?: ReactNode;
  role?: AriaRole;
  title: ReactNode;
  tone?: PlannerStatusTone;
};

export function PlannerEmptyState({
  action,
  className,
  description,
  icon,
  role,
  title,
  tone = "neutral"
}: PlannerEmptyStateProps) {
  return (
    <div
      className={joinClasses("planner-empty-state", `planner-empty-state-${tone}`, className)}
      data-tone={tone}
      role={role}
    >
      <div className="planner-empty-state-icon" aria-hidden="true">
        {icon ?? <RadixIcon decorative name="reader" size={20} />}
      </div>
      <div className="planner-empty-state-copy">
        <RadixHeading as="h2" className="planner-empty-state-title" size="4">
          {title}
        </RadixHeading>
        {description ? (
          <RadixText as="div" className="planner-empty-state-description" tone="muted">
            {description}
          </RadixText>
        ) : null}
      </div>
      {action ? <div className="planner-empty-state-action">{action}</div> : null}
    </div>
  );
}
