import {
  Alert,
  DataTable,
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

      <dl className="package-meta-row" aria-label={`${recommendation.packageNumber} summary`}>
        <div>
          <dt>Score</dt>
          <dd>{recommendation.score}</dd>
        </div>
        <div>
          <dt>Actionability</dt>
          <dd>{recommendation.actionability}</dd>
        </div>
        <div>
          <dt>Estimated work</dt>
          <dd>{formatHours(recommendation.estimatedHours)}</dd>
        </div>
        <div>
          <dt>Blockers</dt>
          <dd>{recommendation.blockers.length}</dd>
        </div>
        <div>
          <dt>Work orders</dt>
          <dd>{recommendation.workOrders.length}</dd>
        </div>
      </dl>

      <div className="recommendation-grid">
        <section aria-label={`${recommendation.packageNumber} explanation`}>
          <h3>Recommendation explanation</h3>
          <p>{recommendation.explanation.text}</p>
        </section>

        <section aria-label={`${recommendation.packageNumber} source-data readiness`}>
          <h3>Source-data readiness</h3>
          <p>{recommendation.sourceDataReadiness.summary}</p>
          <dl className="detail-list detail-list-compact">
            <div>
              <dt>Ready</dt>
              <dd>{recommendation.sourceDataReadiness.readyCount}</dd>
            </div>
            <div>
              <dt>Review</dt>
              <dd>{recommendation.sourceDataReadiness.needsReviewCount}</dd>
            </div>
            <div>
              <dt>Blocked</dt>
              <dd>{recommendation.sourceDataReadiness.blockedCount}</dd>
            </div>
          </dl>
        </section>
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
