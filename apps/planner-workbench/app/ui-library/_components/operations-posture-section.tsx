import {
  PlannerContentSection,
  PlannerDataTable,
  PlannerMetricSummary,
  PlannerStatusBadge
} from "@maintenance-planning/ui-library";
import type {
  OperationsPostureView,
  ScenarioOutcomeSummaryView,
  SourceDataReadinessView
} from "@maintenance-planning/services";
import {
  buildOperationsMetrics,
  toneForPostureState
} from "@/lib/planner-format";
import { signalColumns } from "./showcase-fixtures";

export function OperationsPostureSection({
  posture,
  scenarioSummary,
  sourceReadiness
}: {
  readonly posture: OperationsPostureView;
  readonly scenarioSummary: ScenarioOutcomeSummaryView;
  readonly sourceReadiness: SourceDataReadinessView;
}) {
  return (
    <PlannerContentSection
      badge={
        <PlannerStatusBadge tone={toneForPostureState(posture.state)}>
          {posture.state}
        </PlannerStatusBadge>
      }
      eyebrow="Component family"
      title="Operations posture summaries"
      titleId="showcase-posture"
      variant="surface"
    >
      <PlannerMetricSummary
        ariaLabel="Showcase operations posture summary"
        items={buildOperationsMetrics(posture, sourceReadiness, scenarioSummary.latest)}
      />
      <PlannerDataTable
        caption="UI showcase operations posture signals"
        columns={signalColumns}
        getRowKey={(signal) => signal.label}
        rows={posture.signals}
      />
    </PlannerContentSection>
  );
}
