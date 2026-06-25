import {
  PlannerActionGroup,
  PlannerActionLink,
  PlannerAlert,
  PlannerBadgeGroup,
  PlannerContentSection,
  PlannerDataTable,
  PlannerEmptyState,
  PlannerMetricSummary,
  PlannerPage,
  PlannerPageHeader,
  PlannerQuietNote,
  PlannerStatusBadge,
  PlannerTableCellStack,
  type PlannerDataTableColumn
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

const outcomeColumns: readonly PlannerDataTableColumn<ScenarioOutcomeView>[] = [
  {
    header: "Scenario",
    key: "scenario",
    render: (outcome) => (
      <PlannerTableCellStack detail={outcome.scenarioId} title={outcome.label} />
    ),
    rowHeader: true
  },
  {
    header: "Outcome",
    key: "outcome",
    render: (outcome) => (
      <PlannerStatusBadge tone={toneForScenarioOutcome(outcome.status)}>
        {outcome.statusText}
      </PlannerStatusBadge>
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

const latestSignalColumns: readonly PlannerDataTableColumn<OperationsSignalView>[] = [
  {
    header: "Signal",
    key: "signal",
    render: (signal) => (
      <PlannerTableCellStack detail={signal.summary} title={signal.label} />
    ),
    rowHeader: true
  },
  {
    header: "State",
    key: "state",
    render: (signal) => (
      <PlannerStatusBadge tone={toneForPostureState(signal.status)}>
        {signal.status}
      </PlannerStatusBadge>
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
      <PlannerPage>
        <PlannerPageHeader
          actions={
            <PlannerActionGroup>
              <PlannerActionLink asChild>
                <Link href="/operations-posture">Open operations posture</Link>
              </PlannerActionLink>
              <PlannerActionLink asChild priority="secondary">
                <Link href="/recommendations">Open recommendations</Link>
              </PlannerActionLink>
            </PlannerActionGroup>
          }
          badge={
            <PlannerBadgeGroup align="end">
              <PlannerStatusBadge tone={toneForScenarioOutcome(latest.status)}>
                {latest.statusText}
              </PlannerStatusBadge>
              <PlannerStatusBadge tone="neutral">{runtime.mode} mode</PlannerStatusBadge>
            </PlannerBadgeGroup>
          }
          description="Review deterministic synthetic scenario outcomes, import freshness and planner-facing result signals."
          title={section.label}
        />

        <PlannerMetricSummary
          ariaLabel="Scenario outcome summary"
          items={buildScenarioOutcomeMetrics(scenarioSummary)}
          variant="compact"
        />

        {attentionCount > 0 ? (
          <PlannerAlert title="Scenario review scope" tone="warning">
            <p>
              {attentionCount} synthetic scenario outcome
              {attentionCount === 1 ? " has" : "s have"} stale or degraded evidence visible for
              review.
            </p>
          </PlannerAlert>
        ) : (
          <PlannerQuietNote title="Scenario review scope">
            All synthetic scenario outcomes are in their expected healthy state.
          </PlannerQuietNote>
        )}

        <PlannerContentSection
          badge={
            <PlannerStatusBadge tone={toneForScenarioOutcome(latest.status)}>
              {latest.statusText}
            </PlannerStatusBadge>
          }
          description={latest.summary}
          eyebrow="Latest configured scenario"
          title={latest.label}
          titleId="latest-scenario-outcome"
          variant="surface"
        >
          <PlannerDataTable
            caption="Latest scenario outcome signals"
            columns={latestSignalColumns}
            density="compact"
            description={`Use the signal row header, state and detail columns to review ${latest.label}.`}
            emptyState={
              <PlannerEmptyState
                description="No scenario signals were returned for this synthetic review state."
                title="No scenario signals"
              />
            }
            getRowKey={(signal) => signal.label}
            rows={latest.signals}
          />
        </PlannerContentSection>

        <PlannerContentSection
          badge={
            <PlannerStatusBadge tone="neutral">
              Generated {formatUtc(scenarioSummary.generatedAtUtc)}
            </PlannerStatusBadge>
          }
          eyebrow="Synthetic scenario evidence"
          title="Outcome list"
          titleId="scenario-outcome-list"
          variant="surface"
        >
          <PlannerDataTable
            caption="Synthetic scenario outcomes"
            columns={outcomeColumns}
            density="compact"
            description="Use the scenario row header, outcome, planning run, package count, rejected count, stale count and checked columns to compare synthetic scenario evidence."
            emptyState={
              <PlannerEmptyState
                description="The service returned no synthetic scenario outcomes for this review state."
                title="No scenario outcomes"
              />
            }
            getRowKey={(outcome) => outcome.scenarioId}
            rows={scenarioSummary.outcomes}
          />
        </PlannerContentSection>
      </PlannerPage>
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
