import type { ReactNode } from "react";

export type Tone = "critical" | "info" | "neutral" | "success" | "warning";

type WorkbenchPanelProps = {
  children: ReactNode;
  className?: string;
};

export function WorkbenchPanel({ children, className }: WorkbenchPanelProps) {
  return <section className={joinClasses("workbench-panel", className)}>{children}</section>;
}

type StatusPillProps = {
  children: ReactNode;
  tone?: Tone;
};

export function StatusPill({ children, tone = "neutral" }: StatusPillProps) {
  return <span className={`status-pill status-pill-${tone}`}>{children}</span>;
}

type MetricCardProps = {
  detail: string;
  label: string;
  tone?: Tone;
  value: string;
};

export function MetricCard({ detail, label, tone = "neutral", value }: MetricCardProps) {
  return (
    <article className="metric-card" data-tone={tone}>
      <span className="metric-card-label">{label}</span>
      <strong className="metric-card-value">{value}</strong>
      <span className="metric-card-detail">{detail}</span>
    </article>
  );
}

function joinClasses(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}
