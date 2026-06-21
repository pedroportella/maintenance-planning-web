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
  type LatestImportView,
  type OperationsSignalView
} from "@maintenance-planning/services";
import { getWorkbenchSection } from "@maintenance-planning/utils";
import Link from "next/link";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import {
  buildOperationsMetrics,
  formatUtc,
  toneForFreshness,
  toneForPostureState,
  toneForScenarioOutcome
} from "@/lib/planner-format";

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

export default async function OperationsPosturePage() {
  const section = getWorkbenchSection("operations-posture");

  try {
    const services = createPlannerServices();
    const runtime = services.getRuntimeInfo();
    const [posture, sourceReadiness, scenarioSummary] = await Promise.all([
      services.getOperationsPosture(),
      services.getSourceDataReadiness(),
      services.getScenarioOutcomeSummary()
    ]);
    const latestOutcome = scenarioSummary.latest;

    return (
      <main className="page-stack">
        <PageHeader
          actions={
            <span className="action-row">
              <Link className="primary-link" href="/scenario-outcomes">
                Open scenario outcomes
              </Link>
              <Link className="secondary-link" href={`/planning-runs/${latestOutcome.planningRunId}`}>
                Open latest run
              </Link>
            </span>
          }
          badge={
            <span className="badge-stack">
              <StatusBadge tone={toneForPostureState(posture.state)}>{posture.state}</StatusBadge>
              <StatusBadge tone="neutral">{runtime.mode} mode</StatusBadge>
            </span>
          }
          description="Scan import freshness, source-data readiness and latest scenario evidence for the synthetic planner review state."
          title={section.label}
        />

        <MetricSummary
          ariaLabel="Operations posture summary"
          items={buildOperationsMetrics(posture, sourceReadiness, latestOutcome)}
        />

        <Alert title="Operations review scope" tone={toneForPostureState(posture.state)}>
          <p>{posture.summary}</p>
        </Alert>

        <section className="posture-grid" aria-label="Operations posture details">
          <WorkbenchPanel className="console-panel" labelledBy="posture-signals">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Planner-visible signals</p>
                <h2 id="posture-signals">Posture signals</h2>
              </div>
              <StatusBadge tone={toneForFreshness(posture.freshness)}>{posture.freshness}</StatusBadge>
            </div>
            <DataTable
              caption="Operations posture signals"
              columns={signalColumns}
              getRowKey={(signal) => signal.label}
              rows={posture.signals}
            />
          </WorkbenchPanel>

          <WorkbenchPanel className="console-panel" labelledBy="latest-import">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Latest synthetic import</p>
                <h2 id="latest-import">Import freshness</h2>
              </div>
              <StatusBadge tone={toneForFreshness(posture.freshness)}>{posture.freshness}</StatusBadge>
            </div>
            <LatestImportDetails latestImport={posture.latestImport} />
          </WorkbenchPanel>
        </section>

        <WorkbenchPanel className="console-panel" labelledBy="latest-scenario">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Latest scenario outcome</p>
              <h2 id="latest-scenario">{latestOutcome.label}</h2>
              <p>{latestOutcome.summary}</p>
            </div>
            <StatusBadge tone={toneForScenarioOutcome(latestOutcome.status)}>
              {latestOutcome.statusText}
            </StatusBadge>
          </div>
          <dl className="detail-list detail-list-compact">
            <div>
              <dt>Planning run</dt>
              <dd>{latestOutcome.runNumber}</dd>
            </div>
            <div>
              <dt>Packages</dt>
              <dd>
                {latestOutcome.readyPackageCount} ready, {latestOutcome.blockedPackageCount} blocked
              </dd>
            </div>
            <div>
              <dt>Deferred decisions</dt>
              <dd>{latestOutcome.deferredDecisionCount}</dd>
            </div>
            <div>
              <dt>Checked</dt>
              <dd>{formatUtc(latestOutcome.checkedAtUtc)}</dd>
            </div>
          </dl>
        </WorkbenchPanel>
      </main>
    );
  } catch (error) {
    return (
      <PlannerRouteFailure
        description="The operations posture route reads planner-visible health and freshness evidence through the service boundary."
        error={error}
        title={section.label}
      />
    );
  }
}

function LatestImportDetails({ latestImport }: { latestImport?: LatestImportView | null }) {
  if (!latestImport) {
    return (
      <EmptyState
        description="The service did not return a latest synthetic import summary for this review state."
        title="No latest import"
      />
    );
  }

  return (
    <dl className="detail-list detail-list-compact">
      <div>
        <dt>Source</dt>
        <dd>{latestImport.sourceSystem}</dd>
      </div>
      <div>
        <dt>Import kind</dt>
        <dd>{latestImport.importKind}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{latestImport.status}</dd>
      </div>
      <div>
        <dt>Received</dt>
        <dd>{latestImport.receivedCount}</dd>
      </div>
      <div>
        <dt>Accepted</dt>
        <dd>{latestImport.acceptedCount}</dd>
      </div>
      <div>
        <dt>Rejected</dt>
        <dd>{latestImport.rejectedCount}</dd>
      </div>
      <div>
        <dt>Stale</dt>
        <dd>{latestImport.ignoredStaleCount}</dd>
      </div>
      <div>
        <dt>Completed</dt>
        <dd>{formatUtc(latestImport.completedAtUtc)}</dd>
      </div>
    </dl>
  );
}
