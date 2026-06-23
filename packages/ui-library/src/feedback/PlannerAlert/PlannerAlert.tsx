import type { AriaRole, ReactNode } from "react";
import type { PlannerStatusTone } from "../PlannerStatusBadge";
import { joinClasses } from "../../components/shared";
import { RadixCallout } from "../../radix";

export type PlannerAlertProps = {
  children: ReactNode;
  className?: string;
  role?: AriaRole;
  title?: ReactNode;
  tone?: PlannerStatusTone;
};

export function PlannerAlert({
  children,
  className,
  role,
  title,
  tone = "info"
}: PlannerAlertProps) {
  return (
    <RadixCallout
      className={joinClasses("planner-alert", `planner-alert-${tone}`, className)}
      highContrast
      role={role}
      title={title}
      tone={tone}
      variant={tone === "neutral" ? "surface" : "soft"}
    >
      {children}
    </RadixCallout>
  );
}
