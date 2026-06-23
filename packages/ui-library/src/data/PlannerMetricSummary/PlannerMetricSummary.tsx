import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";
import type { PlannerStatusTone } from "../../feedback";
import { RadixText } from "../../radix";

export type PlannerMetricSummaryItem = {
  detail: ReactNode;
  label: ReactNode;
  tone?: PlannerStatusTone;
  value: ReactNode;
};

export type PlannerMetricCardProps = PlannerMetricSummaryItem & {
  className?: string;
};

export type PlannerMetricSummaryProps = {
  ariaLabel: string;
  className?: string;
  items: readonly PlannerMetricSummaryItem[];
  variant?: "cards" | "compact";
};

export function PlannerMetricCard({
  className,
  detail,
  label,
  tone = "neutral",
  value
}: PlannerMetricCardProps) {
  return (
    <article
      className={joinClasses("planner-metric-card", className)}
      data-tone={tone}
    >
      <RadixText as="span" className="planner-metric-card-label" size="1" tone="muted">
        {label}
      </RadixText>
      <RadixText
        as="span"
        className="planner-metric-card-value"
        size="6"
        tone={tone}
        weight="bold"
      >
        {value}
      </RadixText>
      <RadixText as="span" className="planner-metric-card-detail" size="1" tone="muted">
        {detail}
      </RadixText>
    </article>
  );
}

export function PlannerMetricSummary({
  ariaLabel,
  className,
  items,
  variant = "cards"
}: PlannerMetricSummaryProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={joinClasses(
        "planner-metric-summary",
        `planner-metric-summary-${variant}`,
        className
      )}
      data-variant={variant}
    >
      {items.map((item, index) => (
        <PlannerMetricCard
          detail={item.detail}
          key={typeof item.label === "string" ? item.label : `metric-${index}`}
          label={item.label}
          tone={item.tone}
          value={item.value}
        />
      ))}
    </section>
  );
}

export type PlannerMetricSummarySlot = ReactNode;
