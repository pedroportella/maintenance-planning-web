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
  type PlannerRecommendation
} from "@maintenance-planning/services";
import Link from "next/link";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import {
  buildPlanningRunMetrics,
  formatHours,
  formatUtc,
  isBlockedRecommendation,
  latestDecisionText,
  toneForDecision,
  toneForReadiness,
  toneForStatus
} from "@/lib/planner-format";

export const dynamic = "force-dynamic";

type PlanningRunDetailPageProps = {
  params: Promise<{
    runId: string;
  }>;
};

const recommendationColumns: readonly DataTableColumn<PlannerRecommendation>[] = [
  {
    header: "Package",
    key: "package",
    render: (recommendation) => (
      <span className="table-stack">
        <strong>{recommendation.packageNumber}</strong>
        <span>{recommendation.title}</span>
      </span>
    )
  },
  {
    header: "Readiness",
    key: "readiness",
    render: (recommendation) => (
      <StatusBadge tone={toneForReadiness(recommendation.sourceDataReadiness.status)}>
        {recommendation.sourceDataReadiness.status}
      </StatusBadge>
    )
  },
  {
    align: "end",
    header: "Score",
    key: "score",
    render: (recommendation) => recommendation.score
  },
  {
    align: "end",
    header: "Hours",
    key: "hours",
    render: (recommendation) => formatHours(recommendation.estimatedHours)
  },
  {
    header: "Constraint state",
    key: "blockers",
    render: (recommendation) =>
      recommendation.blockers.length > 0
        ? recommendation.blockers.map((blocker) => blocker.code).join(", ")
        : "No blockers"
  },
  {
    header: "Decision",
    key: "decision",
    render: (recommendation) => {
      const decision = recommendation.decisions.at(-1);

      return (
        <StatusBadge tone={toneForDecision(decision?.decision)}>
          {latestDecisionText(decision)}
        </StatusBadge>
      );
    }
  }
];

export default async function PlanningRunDetailPage({ params }: PlanningRunDetailPageProps) {
  const { runId } = await params;

  try {
    const services = createPlannerServices();
    const runtime = services.getRuntimeInfo();
    const recommendationSet = await services.getRecommendationSet({
      createRunIfMissing: false,
      planningRunId: runId
    });
    const blockedCount = recommendationSet.recommendations.filter(isBlockedRecommendation).length;

    return (
      <main className="page-stack">
        <PageHeader
          actions={
            <Link className="primary-link" href="/recommendations">
              Open decision workbench
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
          description={`Review package groups, source-data readiness and decision history for ${recommendationSet.runNumber}.`}
          title="Planning run detail"
        />

        <MetricSummary
          ariaLabel="Planning run detail summary"
          items={buildPlanningRunMetrics(recommendationSet)}
        />

        <Alert title="Run review posture" tone={blockedCount > 0 ? "warning" : "success"}>
          <p>
            {blockedCount > 0
              ? `${blockedCount} package group cannot be packaged yet because service-owned constraints remain visible.`
              : "No blockers are present in this synthetic planning-run response."}
          </p>
        </Alert>

        <WorkbenchPanel className="console-panel" labelledBy="planning-run-recommendations">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Recommendation detail</p>
              <h2 id="planning-run-recommendations">{recommendationSet.runNumber}</h2>
              <p>Generated window starts {formatUtc(recommendationSet.recommendations[0]?.plannedStartUtc)}.</p>
            </div>
            <StatusBadge tone="neutral">{recommendationSet.planningRunId}</StatusBadge>
          </div>
          <DataTable
            caption="Planning run recommendation detail"
            columns={recommendationColumns}
            emptyState={
              <EmptyState
                description="The service returned no recommendations for this planning run."
                title="No recommendations"
              />
            }
            getRowKey={(recommendation) => recommendation.packageId}
            rows={recommendationSet.recommendations}
          />
        </WorkbenchPanel>
      </main>
    );
  } catch (error) {
    return (
      <PlannerRouteFailure
        description="The planning-run detail route reads package recommendations from the planner service boundary."
        error={error}
        title="Planning run detail"
      />
    );
  }
}
