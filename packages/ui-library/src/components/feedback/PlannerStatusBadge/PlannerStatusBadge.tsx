import type { ReactNode } from "react";
import type { StatusToneName } from "@maintenance-planning/ui-tokens";
import { joinClasses } from "../../../utils";
import { RadixBadge } from "../../radix";

export type PlannerStatusTone = StatusToneName;

export type PlannerStatusBadgeProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  tone?: PlannerStatusTone;
};

export function PlannerStatusBadge({
  children,
  className,
  icon,
  tone = "neutral"
}: PlannerStatusBadgeProps) {
  return (
    <RadixBadge
      className={joinClasses("planner-status-badge", `planner-status-badge-${tone}`, className)}
      data-tone={tone}
      highContrast
      radius="full"
      tone={tone}
      variant="soft"
    >
      {icon ? (
        <span aria-hidden="true" className="planner-status-badge-icon">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </RadixBadge>
  );
}

export const PlannerStatusPill = PlannerStatusBadge;
