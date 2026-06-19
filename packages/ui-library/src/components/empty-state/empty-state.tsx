import type { ReactNode } from "react";
import { joinClasses } from "../shared";

export type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  icon?: ReactNode;
  title: string;
};

export function EmptyState({ action, className, description, icon, title }: EmptyStateProps) {
  return (
    <div className={joinClasses("empty-state", className)}>
      {icon ? <div className="empty-state-icon">{icon}</div> : null}
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  );
}
