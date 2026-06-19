import type { ReactNode } from "react";
import type { Tone } from "../status-badge/status-badge";
import { joinClasses } from "../shared";

export type AlertProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  tone?: Tone;
};

export function Alert({ children, className, title, tone = "info" }: AlertProps) {
  const role = tone === "critical" || tone === "warning" ? "alert" : "status";

  return (
    <div className={joinClasses("workbench-alert", `workbench-alert-${tone}`, className)} role={role}>
      {title ? <strong>{title}</strong> : null}
      <div>{children}</div>
    </div>
  );
}
