import {
  Alert,
  DataTable,
  EmptyState,
  MetricSummary,
  PageHeader,
  StatusBadge,
  WorkbenchPanel,
  type DataTableColumn
} from "@maintenance-planning/ui-library";
import {
  createPlannerServices,
  type PlannerDecisionRecord,
  type PlannerRecommendation,
  type RecommendationBlockerView,
  type WorkOrderBacklogItem
} from "@maintenance-planning/services";
import { getWorkbenchSection } from "@maintenance-planning/utils";
import Link from "next/link";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import { plannerDecisionActions } from "@/lib/planner-decisions";
import {
  buildRecommendationMetrics,
  formatHours,
  formatUtc,
  isBlockedRecommendation,
  isReadyRecommendation,
  toneForDecision,
  toneForReadiness,
  toneForStatus
} from "@/lib/planner-format";
import { recordRecommendationDecision } from "./actions";

export const dynamic = "force-dynamic";

type RecommendationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

export default async function RecommendationsPage({ searchParams }: RecommendationsPageProps) {
  const section = getWorkbenchSection("recommendations");
  const params = (await searchParams) ?? {};

  try {
    const services = createPlannerServices();
    const runtime = services.getRuntimeInfo();
    const recommendationSet = await services.getRecommendationSet();
    const blockedCount = recommendationSet.recommendations.filter(isBlockedRecommendation).length;

    return (
      <main className="page-stack">
        <PageHeader
          actions={
            <Link className="primary-link" href={`/planning-runs/${recommendationSet.planningRunId}`}>
              Open planning run
            </Link>
          }
          badge={
            <span className="badge-stack">
              <StatusBadge tone={toneForStatus(recommendationSet.status)}>
                {recommendationSet.status}
              </StatusBadge>
              <StatusBadge tone="neutral">{runtime.mode} mode</StatusBadge>
            </span>
          }
          description="Review package recommendations, blocker explanations, source-data readiness and planner decisions from the service contract."
          title={section.label}
        />

        <MetricSummary
          ariaLabel="Recommendation workbench summary"
          items={buildRecommendationMetrics(recommendationSet)}
        />

        {renderDecisionNotice(params)}

        <Alert title="Decision review scope" tone={blockedCount > 0 ? "warning" : "success"}>
          <p>
            {blockedCount > 0
              ? "Some package groups cannot be packaged yet. Review blockers and record an accept, reject or defer decision through the service boundary."
              : "All package groups in this synthetic response are ready for planner decision review."}
          </p>
        </Alert>

        <section className="recommendation-list" aria-label="Package recommendations">
          {recommendationSet.recommendations.length > 0 ? (
            recommendationSet.recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.packageId}
                recommendation={recommendation}
              />
            ))
          ) : (
            <EmptyState
              description="The service returned no package recommendations for this planning run."
              title="No recommendations"
            />
          )}
        </section>
      </main>
    );
  } catch (error) {
    return (
      <PlannerRouteFailure
        description="The recommendation route reads package recommendations and records decisions through the planner service boundary."
        error={error}
        title={section.label}
      />
    );
  }
}

function RecommendationCard({ recommendation }: { recommendation: PlannerRecommendation }) {
  const headingId = `recommendation-${recommendation.packageNumber.toLowerCase()}`;
  const readyForAcceptance = isReadyRecommendation(recommendation);

  return (
    <WorkbenchPanel as="article" className="recommendation-card" labelledBy={headingId}>
      <div className="recommendation-card-header">
        <div>
          <p className="eyebrow">Package recommendation</p>
          <h2 id={headingId}>{recommendation.packageNumber}</h2>
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

      <div className="recommendation-grid">
        <section aria-label={`${recommendation.packageNumber} explanation`}>
          <h3>Recommendation explanation</h3>
          <p>{recommendation.explanation.text}</p>
          <dl className="detail-list">
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
          </dl>
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
        getRowKey={(item) => item.id}
        rows={recommendation.workOrders}
      />

      <RecommendationDecisions decisions={recommendation.decisions} />

      <form
        action={recordRecommendationDecision}
        aria-label={`Record planner decision for ${recommendation.packageNumber}`}
        className="decision-form"
      >
        <input name="packageId" type="hidden" value={recommendation.packageId} />
        {recommendation.workOrders.map((workOrder) => (
          <input
            key={workOrder.id}
            name="workOrderIds"
            type="hidden"
            value={workOrder.id}
          />
        ))}
        <label className="decision-notes">
          <span>Decision note</span>
          <textarea
            name="notes"
            placeholder="Optional synthetic planner note"
            rows={2}
          />
        </label>
        <div className="decision-actions" role="group" aria-label="Planner decision actions">
          {plannerDecisionActions.map((action) => {
            const disabled = action.decision === "Accepted" && !readyForAcceptance;

            return (
              <button
                className={`decision-button decision-button-${action.tone}`}
                disabled={disabled}
                key={action.actionCode}
                name="actionCode"
                type="submit"
                value={action.actionCode}
              >
                <span>{action.label}</span>
                <small>{disabled ? "Resolve blockers before accepting." : action.description}</small>
              </button>
            );
          })}
        </div>
      </form>
    </WorkbenchPanel>
  );
}

function RecommendationBlockers({ blockers }: { blockers: readonly RecommendationBlockerView[] }) {
  if (blockers.length === 0) {
    return (
      <Alert title="No package blockers" tone="success">
        <p>Service-owned constraints do not show a blocker for this package group.</p>
      </Alert>
    );
  }

  return (
    <Alert title="Package blockers" tone="warning">
      <ul className="plain-list">
        {blockers.map((blocker) => (
          <li key={blocker.code}>
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
      <Alert title="No decision recorded" tone="neutral">
        <p>Record a planner decision when this recommendation has been reviewed.</p>
      </Alert>
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

function renderDecisionNotice(params: Record<string, string | string[] | undefined>) {
  const result = readParam(params, "decisionResult");

  if (result === "success") {
    const decision = readParam(params, "decision") ?? "Decision";
    const packageNumber = readParam(params, "packageNumber") ?? "the package";

    return (
      <Alert title="Decision recorded" tone="success">
        <p>
          {decision} was recorded for {packageNumber} through the planner service boundary.
        </p>
      </Alert>
    );
  }

  if (result === "unauthorized") {
    return (
      <Alert title="Decision was not recorded" tone="critical">
        <p>Planner access needs attention before a decision can be recorded.</p>
      </Alert>
    );
  }

  if (result === "error") {
    return (
      <Alert title="Decision was not recorded" tone="critical">
        <p>The planner service could not record the decision. Review the input and try again.</p>
      </Alert>
    );
  }

  return null;
}

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}
