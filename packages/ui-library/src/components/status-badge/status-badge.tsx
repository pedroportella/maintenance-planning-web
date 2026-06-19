import type { ReactNode } from "react";
import type { StatusToneName } from "@maintenance-planning/ui-tokens";
import { joinClasses } from "../shared";

export type Tone = StatusToneName;

export type StatusBadgeProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  tone?: Tone;
};

export function StatusBadge({
  children,
  className,
  icon,
  tone = "neutral"
}: StatusBadgeProps) {
  return (
    <span className={joinClasses("status-badge", `status-badge-${tone}`, className)} data-tone={tone}>
      {icon ? <span className="status-badge-icon">{icon}</span> : null}
      <span>{children}</span>
    </span>
  );
}

export const StatusPill = StatusBadge;
