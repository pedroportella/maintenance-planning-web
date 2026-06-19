import type { Metadata } from "next";
import {
  Alert,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  MetricSummary,
  PageHeader,
  StatusBadge,
  StatusPill,
  WorkbenchPanel,
  type DataTableColumn,
  type Tone
} from "@maintenance-planning/ui-library";
import {
  createPlannerServices,
  type OperationsSignalView,
  type PlannerRecommendation,
  type WorkOrderBacklogItem
} from "@maintenance-planning/services";
import {
  buildOperationsMetrics,
  formatHours,
  formatUtc,
  toneForPostureState,
  toneForReadiness,
  toneForStatus
} from "@/lib/planner-format";

export const metadata: Metadata = {
  title: "UI Library Evidence | Planner Workbench",
  description: "Reviewer and developer evidence for synthetic planner workbench UI states.",
  robots: {
    follow: false,
    index: false
  }
};

export const dynamic = "force-static";

type ToneExample = {
  readonly detail: string;
  readonly label: string;
  readonly tone: Tone;
};

const toneExamples: readonly ToneExample[] = [
  {
    detail: "Critical blockers or request failures.",
    label: "Critical",
    tone: "critical"
  },
  {
    detail: "Informational review context.",
    label: "Info",
    tone: "info"
  },
  {
    detail: "Quiet secondary metadata.",
    label: "Neutral",
    tone: "neutral"
  },
  {
    detail: "Ready or completed synthetic states.",
    label: "Success",
    tone: "success"
  },
  {
    detail: "Planner attention without a hard stop.",
    label: "Warning",
    tone: "warning"
  }
];

const signalColumns: readonly DataTableColumn<OperationsSignalView>[] = [
  {
    header: "Signal",
    key: "signal",
    render: (signal) => (
      <span className="table-stack">
        <strong>{signal.label}</strong>
        <span>{signal.summary}</span>
      </span>
    )
  },
  {
    header: "State",
    key: "state",
    render: (signal) => (
      <StatusBadge tone={toneForPostureState(signal.status)}>{signal.status}</StatusBadge>
    )
  },
  {
    header: "Detail",
    key: "detail",
    render: (signal) => signal.detail ?? "No extra detail"
  },
  {
    align: "end",
    header: "Checked",
    key: "checked",
    render: (signal) => formatUtc(signal.checkedAtUtc)
  }
];

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
      <StatusBadge tone={toneForReadiness(item.readinessStatus)}>
        {item.readinessStatus}
      </StatusBadge>
    )
  },
  {
    header: "Issue",
    key: "issue",
    render: (item) => item.readinessIssueCode ?? "Ready for review"
  },
  {
    align: "end",
    header: "Hours",
    key: "hours",
    render: (item) => formatHours(item.estimatedHours)
  }
];

export default async function UiLibraryPage() {
  const partsDelayServices = createPlannerServices({
    config: {
      mockScenarioId: "parts-delay-replan",
      mode: "mock"
    }
  });

  const [recommendationSet, backlog, posture, sourceReadiness, scenarioSummary] =
    await Promise.all([
      partsDelayServices.getRecommendationSet(),
      partsDelayServices.getWorkOrderBacklog(),
      partsDelayServices.getOperationsPosture(),
      partsDelayServices.getSourceDataReadiness(),
      partsDelayServices.getScenarioOutcomeSummary()
    ]);

  return (
    <main className="page-stack ui-library-page">
      <PageHeader
        badge={
          <span className="badge-stack">
            <StatusBadge tone="info">Reviewer evidence</StatusBadge>
            <StatusBadge tone="neutral">Static mock data</StatusBadge>
          </span>
        }
        description="Focused visual and accessibility evidence for reusable synthetic planner workbench states."
        eyebrow="Developer route"
        title="UI library showcase"
      />

      <Alert title="Route scope" tone="info">
        <p>
          This page is an internal reviewer and developer aid. It uses checked synthetic fixtures
          and does not call a backend service.
        </p>
      </Alert>

      <WorkbenchPanel className="console-panel" labelledBy="showcase-alerts">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Component family</p>
            <h2 id="showcase-alerts">Alerts and badges</h2>
          </div>
          <StatusBadge tone="neutral">All tones</StatusBadge>
        </div>
        <div className="showcase-tone-grid">
          {toneExamples.map((example) => (
            <Alert key={example.tone} title={`${example.label} alert`} tone={example.tone}>
              <p>{example.detail}</p>
            </Alert>
          ))}
        </div>
        <section aria-label="Status badge tone examples" className="showcase-badge-row">
          {toneExamples.map((example) => (
            <StatusBadge key={example.tone} tone={example.tone}>
              {example.label}
            </StatusBadge>
          ))}
          {toneExamples.map((example) => (
            <StatusPill key={`${example.tone}-pill`} tone={example.tone}>
              {example.label} pill
            </StatusPill>
          ))}
        </section>
      </WorkbenchPanel>

      <WorkbenchPanel className="console-panel" labelledBy="showcase-tables">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Component family</p>
            <h2 id="showcase-tables">Tables and row states</h2>
          </div>
          <StatusBadge tone="warning">Scrollable on small screens</StatusBadge>
        </div>
        <DataTable
          caption="UI showcase work-order rows"
          columns={workOrderColumns}
          getRowKey={(item) => item.id}
          rows={backlog.items}
        />
        <DataTable
          caption="UI showcase empty table"
          columns={workOrderColumns}
          emptyState={
            <EmptyState
              description="The table shell stays stable when a filtered synthetic review state has no rows."
              title="No matching rows"
            />
          }
          getRowKey={(item) => item.id}
          rows={[]}
        />
      </WorkbenchPanel>

      <WorkbenchPanel className="console-panel" labelledBy="showcase-states">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Component family</p>
            <h2 id="showcase-states">Empty, loading and error states</h2>
          </div>
          <StatusBadge tone="info">Live-region checks</StatusBadge>
        </div>
        <div className="showcase-state-grid">
          <EmptyState
            description="No synthetic package matches this reviewer filter."
            title="No package selected"
          />
          <div className="showcase-loading-state">
            <LoadingState label="Loading planner review data" />
          </div>
          <ErrorState
            description="The service boundary returned a configuration issue for this local review."
            title="Review state unavailable"
          />
        </div>
      </WorkbenchPanel>

      {recommendationSet.recommendations.length > 0 ? (
        <WorkbenchPanel className="console-panel" labelledBy="showcase-recommendations">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Component family</p>
              <h2 id="showcase-recommendations">Recommendation cards</h2>
            </div>
            <StatusBadge tone={toneForStatus(recommendationSet.status)}>
              {recommendationSet.status}
            </StatusBadge>
          </div>
          <section className="recommendation-list" aria-label="Showcase recommendation cards">
            {recommendationSet.recommendations.map((recommendation) => (
              <ShowcaseRecommendationCard
                key={recommendation.packageId}
                recommendation={recommendation}
              />
            ))}
          </section>
        </WorkbenchPanel>
      ) : null}

      <WorkbenchPanel className="console-panel" labelledBy="showcase-posture">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Component family</p>
            <h2 id="showcase-posture">Operations posture summaries</h2>
          </div>
          <StatusBadge tone={toneForPostureState(posture.state)}>{posture.state}</StatusBadge>
        </div>
        <MetricSummary
          ariaLabel="Showcase operations posture summary"
          items={buildOperationsMetrics(posture, sourceReadiness, scenarioSummary.latest)}
        />
        <DataTable
          caption="UI showcase operations posture signals"
          columns={signalColumns}
          getRowKey={(signal) => signal.label}
          rows={posture.signals}
        />
      </WorkbenchPanel>
    </main>
  );
}

function ShowcaseRecommendationCard({
  recommendation
}: {
  readonly recommendation: PlannerRecommendation;
}) {
  return (
    <article aria-label={recommendation.packageNumber} className="recommendation-card">
      <div className="recommendation-card-header">
        <div>
          <p className="eyebrow">Synthetic package recommendation</p>
          <h3>{recommendation.packageNumber}</h3>
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
          <h3>Explanation</h3>
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

        <section aria-label={`${recommendation.packageNumber} readiness`}>
          <h3>Readiness</h3>
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

      <Alert
        title={recommendation.blockers.length > 0 ? "Package blockers" : "No package blockers"}
        tone={recommendation.blockers.length > 0 ? "warning" : "success"}
      >
        {recommendation.blockers.length > 0 ? (
          <ul className="plain-list">
            {recommendation.blockers.map((blocker) => (
              <li key={`${blocker.code}-${blocker.workOrderNumbers.join("-")}`}>
                <strong>{blocker.code}</strong>: {blocker.summary}
              </li>
            ))}
          </ul>
        ) : (
          <p>Service-owned constraints do not show a blocker for this package group.</p>
        )}
      </Alert>
    </article>
  );
}
