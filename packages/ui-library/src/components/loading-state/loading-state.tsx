import type { ReactNode } from "react";
import { joinClasses } from "../shared";

export type LoadingStateProps = {
  className?: string;
  label?: string;
};

export type ErrorStateProps = {
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  title: string;
};

export function LoadingState({ className, label = "Loading" }: LoadingStateProps) {
  return (
    <div aria-busy="true" className={joinClasses("loading-state", className)} role="status">
      <span aria-hidden="true" className="loading-state-indicator" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ action, className, description, title }: ErrorStateProps) {
  return (
    <div className={joinClasses("error-state", className)} role="alert">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
