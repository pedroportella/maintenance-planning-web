import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";
import {
  PlannerSummaryList,
  type PlannerSummaryListItem
} from "../../data";
import {
  PlannerStatusBadge,
  type PlannerStatusTone
} from "../../feedback";
import { PlannerActionGroup } from "../../layout";
import { RadixText } from "../../radix";

export type PlannerDecisionSummaryProps = {
  actions?: ReactNode;
  className?: string;
  decidedAt: ReactNode;
  decidedBy: ReactNode;
  decision: ReactNode;
  note?: ReactNode;
  packageNumber: string;
  reason: ReactNode;
  summary?: ReactNode;
  title?: ReactNode;
  titleId?: string;
  tone?: PlannerStatusTone;
};

export function PlannerDecisionSummary({
  actions,
  className,
  decidedAt,
  decidedBy,
  decision,
  note,
  packageNumber,
  reason,
  summary,
  title = "Latest decision recorded",
  titleId,
  tone = "info"
}: PlannerDecisionSummaryProps) {
  const items: readonly PlannerSummaryListItem[] = [
    {
      id: "reason",
      label: "Reason",
      tone,
      value: reason
    },
    {
      id: "decided-at",
      label: "Recorded",
      value: decidedAt
    },
    {
      id: "decided-by",
      label: "Decision maker",
      value: decidedBy
    }
  ];

  return (
    <section
      aria-labelledby={titleId}
      className={joinClasses("planner-decision-summary", className)}
      data-tone={tone}
    >
      <header className="planner-decision-summary-header">
        <div className="planner-decision-summary-copy">
          <p className="planner-decision-summary-eyebrow">Planner decision</p>
          <h3 id={titleId}>{title}</h3>
          <RadixText as="p" size="2" tone="muted">
            {summary ?? `The latest decision for ${packageNumber} is recorded.`}
          </RadixText>
        </div>
        <PlannerStatusBadge tone={tone}>{decision}</PlannerStatusBadge>
      </header>

      <PlannerSummaryList
        ariaLabel={`${packageNumber} latest decision facts`}
        className="planner-decision-summary-facts"
        items={items}
        variant="compact"
      />

      {note ? (
        <div className="planner-decision-summary-note">
          <RadixText as="span" size="1" tone="muted" weight="bold">
            Decision note
          </RadixText>
          <p>{note}</p>
        </div>
      ) : null}

      {actions ? (
        <footer className="planner-decision-summary-actions">
          <PlannerActionGroup align="start">{actions}</PlannerActionGroup>
        </footer>
      ) : null}
    </section>
  );
}
