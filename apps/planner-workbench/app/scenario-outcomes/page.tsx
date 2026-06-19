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
  type OperationsSignalView,
  type ScenarioOutcomeView
} from "@maintenance-planning/services";
import { getWorkbenchSection } from "@maintenance-planning/utils";
import Link from "next/link";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import {
  buildScenarioOutcomeMetrics,
  formatUtc,
  toneForPostureState,
  toneForScenarioOutcome
} from "@/lib/planner-format";

export const dynamic = "force-dynamic";

const outcomeColumns: readonly DataTableColumn<ScenarioOutcomeView>[] = [
  {
    header: "Scenario",
    key: "scenario",
    render: (outcome) => (
      <span className="table-stack">
        <strong>{outcome.label}</strong>
        <span>{outcome.scenarioId}</span>
      </span>
    )
  },
  {
    header: "Outcome",
    key: "outcome",
    render: (outcome) => (
      <StatusBadge tone={toneForScenarioOutcome(outcome.status)}>
        {outcome.statusText}
      </StatusBadge>
    )
  },
  {
    header: "Planning run",
    key: "planning-run",
    render: (outcome) => outcome.runNumber
  },
  {
    align: "end",
    header: "Packages",
    key: "packages",
    render: (outcome) => outcome.packageCount
  },
  {
    align: "end",
    header: "Rejected",
    key: "rejected",
    render: (outcome) => outcome.latestImport?.rejectedCount ?? "Not reported"
  },
  {
    align: "end",
    header: "Stale",
    key: "stale",
    render: (outcome) => outcome.latestImport?.ignoredStaleCount ?? "Not reported"
  },
  {
    align: "end",
    header: "Checked",
    key: "checked",
    render: (outcome) => formatUtc(outcome.checkedAtUtc)
  }
];

const latestSignalColumns: readonly DataTableColumn<OperationsSignalView>[] = [
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
  }
];

export default async function ScenarioOutcomesPage() {
  const section = getWorkbenchSection("scenario-outcomes");

  try {
    const services = createPlannerServices();
    const runtime = services.getRuntimeInfo();
    const scenarioSummary = await services.getScenarioOutcomeSummary();
    const latest = scenarioSummary.latest;
    const attentionCount = scenarioSummary.outcomes.filter(
      (outcome) => outcome.status !== "healthy"
    ).length;

    return (
      <main className="page-stack">
        <PageHeader
          actions={
            <span className="action-row">
              <Link className="primary-link" href="/operations-posture">
                Open operations posture
              </Link>
              <Link className="secondary-link" href="/recommendations">
                Open recommendations
              </Link>
            </span>
          }
          badge={
            <span className="badge-stack">
              <StatusBadge tone={toneForScenarioOutcome(latest.status)}>
                {latest.statusText}
              </StatusBadge>
              <StatusBadge tone="neutral">{runtime.mode} mode</StatusBadge>
            </span>
          }
          description="Review deterministic synthetic scenario outcomes, import freshness and planner-facing result signals."
          title={section.label}
        />

        <MetricSummary
          ariaLabel="Scenario outcome summary"
          items={buildScenarioOutcomeMetrics(scenarioSummary)}
        />

        <Alert title="Scenario review scope" tone={attentionCount > 0 ? "warning" : "success"}>
          <p>
            {attentionCount > 0
              ? `${attentionCount} synthetic scenario outcome has stale or degraded evidence visible for review.`
              : "All synthetic scenario outcomes are in their expected healthy state."}
          </p>
        </Alert>

        <WorkbenchPanel className="console-panel" labelledBy="latest-scenario-outcome">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Latest configured scenario</p>
              <h2 id="latest-scenario-outcome">{latest.label}</h2>
              <p>{latest.summary}</p>
            </div>
            <StatusBadge tone={toneForScenarioOutcome(latest.status)}>
              {latest.statusText}
            </StatusBadge>
          </div>
          <DataTable
            caption="Latest scenario outcome signals"
            columns={latestSignalColumns}
            emptyState={
              <EmptyState
                description="No scenario signals were returned for this synthetic review state."
                title="No scenario signals"
              />
            }
            getRowKey={(signal) => signal.label}
            rows={latest.signals}
          />
        </WorkbenchPanel>

        <WorkbenchPanel className="console-panel" labelledBy="scenario-outcome-list">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Synthetic scenario evidence</p>
              <h2 id="scenario-outcome-list">Outcome list</h2>
            </div>
            <StatusBadge tone="neutral">Generated {formatUtc(scenarioSummary.generatedAtUtc)}</StatusBadge>
          </div>
          <DataTable
            caption="Synthetic scenario outcomes"
            columns={outcomeColumns}
            emptyState={
              <EmptyState
                description="The service returned no synthetic scenario outcomes for this review state."
                title="No scenario outcomes"
              />
            }
            getRowKey={(outcome) => outcome.scenarioId}
            rows={scenarioSummary.outcomes}
          />
        </WorkbenchPanel>
      </main>
    );
  } catch (error) {
    return (
      <PlannerRouteFailure
        description="The scenario outcomes route reads synthetic scenario evidence through the planner service boundary."
        error={error}
        title={section.label}
      />
    );
  }
}
