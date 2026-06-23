import {
  Alert,
  DataTable,
  EmptyState,
  MetricSummary,
  PageHeader,
  PlannerMetadataPanel,
  QuietNote,
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
  toneForPostureState
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
          variant="compact"
        />

        {posture.state === "healthy" ? (
          <QuietNote title="Operations review scope">{posture.summary}</QuietNote>
        ) : (
          <Alert title="Operations review scope" tone={toneForPostureState(posture.state)}>
            <p>{posture.summary}</p>
          </Alert>
        )}

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
              density="compact"
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

        <QuietNote title={`Latest scenario: ${latestOutcome.label}`}>
          <p>{latestOutcome.summary}</p>
          <p>
            {latestOutcome.runNumber}: {latestOutcome.readyPackageCount} ready,{" "}
            {latestOutcome.blockedPackageCount} blocked, checked{" "}
            {formatUtc(latestOutcome.checkedAtUtc)}.
          </p>
        </QuietNote>
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
    <PlannerMetadataPanel
      density="compact"
      items={[
        {
          id: "source",
          label: "Source",
          value: latestImport.sourceSystem
        },
        {
          id: "import-kind",
          label: "Import kind",
          value: latestImport.importKind
        },
        {
          id: "status",
          label: "Status",
          tone: latestImport.status === "accepted" ? "success" : "warning",
          value: latestImport.status
        },
        {
          id: "received",
          label: "Received",
          value: latestImport.receivedCount
        },
        {
          id: "accepted",
          label: "Accepted",
          tone: "success",
          value: latestImport.acceptedCount
        },
        {
          id: "rejected",
          label: "Rejected",
          tone: latestImport.rejectedCount > 0 ? "critical" : "neutral",
          value: latestImport.rejectedCount
        },
        {
          id: "stale",
          label: "Stale",
          tone: latestImport.ignoredStaleCount > 0 ? "warning" : "neutral",
          value: latestImport.ignoredStaleCount
        },
        {
          id: "completed",
          label: "Completed",
          value: formatUtc(latestImport.completedAtUtc)
        }
      ]}
      summaryAriaLabel="Latest import facts"
      title="Latest import facts"
      titleId="latest-import-facts"
    />
  );
}
