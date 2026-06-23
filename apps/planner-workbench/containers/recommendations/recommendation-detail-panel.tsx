import {
  Alert,
  DataTable,
  PlannerMetadataPanel,
  PlannerSummaryList,
  QuietNote,
  StatusBadge,
  WorkbenchPanel,
  type DataTableColumn
} from "@maintenance-planning/ui-library";
import type {
  PlannerDecisionRecord,
  PlannerRecommendation,
  RecommendationBlockerView,
  WorkOrderBacklogItem
} from "@maintenance-planning/services";
import {
  formatHours,
  formatUtc,
  toneForDecision,
  toneForReadiness,
  toneForStatus
} from "@/lib/planner-format";
import { RecommendationDecisionForm } from "./recommendation-decision-form";

type RecommendationDetailPanelProps = {
  recommendation: PlannerRecommendation;
  planningRunId: string;
};

const workOrderColumns: readonly DataTableColumn<WorkOrderBacklogItem>[] = [
  {
    header: "Work order",
    key: "work-order",
    render: (item) => (
      <span className="table-stack">
        <strong>{item.workOrderNumber}</strong>
        <span>{item.title}</span>
      </span>
    )
  },
  {
    header: "Readiness",
    key: "readiness",
    render: (item) => (
      <StatusBadge tone={toneForReadiness(item.readinessStatus)}>{item.readinessStatus}</StatusBadge>
    )
  },
  {
    header: "Asset context",
    key: "asset",
    render: (item) => item.assetName ?? item.functionalLocationName ?? "Not supplied"
  },
  {
    align: "end",
    header: "Hours",
    key: "hours",
    render: (item) => formatHours(item.estimatedHours)
  },
  {
    align: "end",
    header: "Due",
    key: "due",
    render: (item) => formatUtc(item.dueAtUtc)
  }
];

export function RecommendationDetailPanel({
  recommendation,
  planningRunId
}: RecommendationDetailPanelProps) {
  const headingId = `recommendation-detail-${recommendation.packageId}`;

  return (
    <WorkbenchPanel as="article" className="recommendation-card" labelledBy={headingId}>
      <div className="recommendation-card-header">
        <div>
          <p className="eyebrow">Package recommendation</p>
          <h2 id={headingId}>Why this package</h2>
          <p>{recommendation.title}</p>
        </div>
        <span className="badge-stack">
          <StatusBadge tone={toneForStatus(recommendation.status)}>
            {recommendation.status}
          </StatusBadge>
          <StatusBadge tone={toneForReadiness(recommendation.sourceDataReadiness.status)}>
            {recommendation.sourceDataReadiness.status}
          </StatusBadge>
        </span>
      </div>

      <PlannerSummaryList
        ariaLabel={`${recommendation.packageNumber} summary`}
        className="recommendation-package-summary"
        items={[
          {
            id: "score",
            label: "Score",
            tone: "info",
            value: recommendation.score
          },
          {
            id: "actionability",
            label: "Actionability",
            tone: recommendation.actionability === "ready" ? "success" : "warning",
            value: recommendation.actionability
          },
          {
            id: "estimated-work",
            label: "Estimated work",
            value: formatHours(recommendation.estimatedHours)
          },
          {
            id: "blockers",
            label: "Blockers",
            tone: recommendation.blockers.length > 0 ? "warning" : "success",
            value: recommendation.blockers.length
          },
          {
            id: "work-orders",
            label: "Work orders",
            value: recommendation.workOrders.length
          }
        ]}
        variant="compact"
      />

      <div className="recommendation-grid">
        <section aria-label={`${recommendation.packageNumber} explanation`}>
          <h3>Recommendation explanation</h3>
          <p>{recommendation.explanation.text}</p>
        </section>

        <PlannerMetadataPanel
          description={recommendation.sourceDataReadiness.summary}
          density="compact"
          items={[
            {
              id: "ready",
              label: "Ready",
              tone: "success",
              value: recommendation.sourceDataReadiness.readyCount
            },
            {
              id: "review",
              label: "Review",
              tone: "warning",
              value: recommendation.sourceDataReadiness.needsReviewCount
            },
            {
              id: "blocked",
              label: "Blocked",
              tone: "critical",
              value: recommendation.sourceDataReadiness.blockedCount
            }
          ]}
          summaryAriaLabel={`${recommendation.packageNumber} source-data readiness facts`}
          title="Source-data readiness"
          titleId={`${headingId}-source-readiness`}
        />
      </div>

      <RecommendationBlockers blockers={recommendation.blockers} />

      <DataTable
        caption={`${recommendation.packageNumber} work orders`}
        columns={workOrderColumns}
        density="compact"
        getRowKey={(item) => item.id}
        rows={recommendation.workOrders}
      />

      <RecommendationDecisions decisions={recommendation.decisions} />

      <RecommendationDecisionForm
        planningRunId={planningRunId}
        recommendation={recommendation}
      />
    </WorkbenchPanel>
  );
}

function RecommendationBlockers({ blockers }: { blockers: readonly RecommendationBlockerView[] }) {
  if (blockers.length === 0) {
    return (
      <QuietNote title="No package blockers">
        Service-owned constraints do not show a blocker for this package group.
      </QuietNote>
    );
  }

  return (
    <Alert title="Package blockers" tone="warning">
      <ul className="plain-list">
        {blockers.map((blocker, index) => (
          <li key={`${blocker.code}-${blocker.workOrderNumbers.join("-")}-${index}`}>
            <strong>{blocker.code}</strong>: {blocker.summary}
          </li>
        ))}
      </ul>
    </Alert>
  );
}

function RecommendationDecisions({
  decisions
}: {
  decisions: readonly PlannerDecisionRecord[];
}) {
  if (decisions.length === 0) {
    return (
      <QuietNote title="No decision recorded">
        Record a planner decision when this recommendation has been reviewed.
      </QuietNote>
    );
  }

  return (
    <section className="decision-history" aria-label="Planner decision history">
      <h3>Decision history</h3>
      <ul className="plain-list">
        {decisions.map((decision) => (
          <li key={decision.id}>
            <StatusBadge tone={toneForDecision(decision.decision)}>{decision.decision}</StatusBadge>
            <span>{decision.reasonCode}</span>
            <small>{formatUtc(decision.decidedAtUtc)}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
