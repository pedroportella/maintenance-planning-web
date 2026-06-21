import type { ReactNode } from "react";
import type { Tone } from "../status-badge/status-badge";
import { joinClasses } from "../shared";

export type MetricSummaryItem = {
  detail: string;
  label: string;
  tone?: Tone;
  value: string;
};

export type MetricCardProps = MetricSummaryItem & {
  className?: string;
};

export type MetricSummaryProps = {
  ariaLabel: string;
  className?: string;
  items: readonly MetricSummaryItem[];
  variant?: "cards" | "compact";
};

export function MetricCard({
  className,
  detail,
  label,
  tone = "neutral",
  value
}: MetricCardProps) {
  return (
    <article className={joinClasses("metric-card", className)} data-tone={tone}>
      <span className="metric-card-label">{label}</span>
      <strong className="metric-card-value">{value}</strong>
      <span className="metric-card-detail">{detail}</span>
    </article>
  );
}

export function MetricSummary({
  ariaLabel,
  className,
  items,
  variant = "cards"
}: MetricSummaryProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={joinClasses("metric-summary", `metric-summary-${variant}`, className)}
    >
      {items.map((item) => (
        <MetricCard
          detail={item.detail}
          key={item.label}
          label={item.label}
          tone={item.tone}
          value={item.value}
        />
      ))}
    </section>
  );
}

export type MetricSummarySlot = ReactNode;
