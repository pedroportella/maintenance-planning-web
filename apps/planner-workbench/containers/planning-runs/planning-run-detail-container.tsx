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
  PlannerStatusBadge,
  PlannerTableCellStack,
  type PlannerDataTableColumn
} from "@maintenance-planning/ui-library";
import {
  createPlannerServices,
  type PlannerRecommendation
} from "@maintenance-planning/services";
import Link from "next/link";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import { packageRecommendationHref } from "@/containers/recommendations/recommendation-links";
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

type PlanningRunDetailPageProps = {
  params: Promise<{
    runId: string;
  }>;
};

function buildRecommendationColumns(
  planningRunId: string
): readonly PlannerDataTableColumn<PlannerRecommendation>[] {
  return [
  {
    header: "Package",
    key: "package",
    render: (recommendation) => (
      <PlannerTableCellStack
        detail={recommendation.title}
        title={
          <Link
            href={packageRecommendationHref(recommendation.packageId, {
              planningRunId
            })}
          >
            {recommendation.packageNumber}
          </Link>
        }
      />
    ),
    rowHeader: true
  },
  {
    header: "Readiness",
    key: "readiness",
    render: (recommendation) => (
      <PlannerStatusBadge tone={toneForReadiness(recommendation.sourceDataReadiness.status)}>
        {recommendation.sourceDataReadiness.status}
      </PlannerStatusBadge>
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
        <PlannerStatusBadge tone={toneForDecision(decision?.decision)}>
          {latestDecisionText(decision)}
        </PlannerStatusBadge>
      );
    }
  }
  ];
}

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
    const recommendationColumns = buildRecommendationColumns(recommendationSet.planningRunId);

    return (
      <PlannerPage>
        <PlannerPageHeader
          actions={
            <PlannerActionGroup>
              <PlannerActionLink asChild>
                <Link href="/recommendations">Open decision workbench</Link>
              </PlannerActionLink>
              <PlannerActionLink asChild priority="secondary">
                <Link href="/operations-posture">Open operations posture</Link>
              </PlannerActionLink>
            </PlannerActionGroup>
          }
          badge={
            <PlannerBadgeGroup align="end">
              <PlannerStatusBadge tone={toneForStatus(recommendationSet.status)}>
                {recommendationSet.status}
              </PlannerStatusBadge>
              <PlannerStatusBadge tone="neutral">{runtime.mode} mode</PlannerStatusBadge>
            </PlannerBadgeGroup>
          }
          description={`Review package groups, source-data readiness and decision history for ${recommendationSet.runNumber}.`}
          title="Planning run detail"
        />

        <PlannerMetricSummary
          ariaLabel="Planning run detail summary"
          items={buildPlanningRunMetrics(recommendationSet)}
          variant="compact"
        />

        <PlannerAlert title="Run review posture" tone={blockedCount > 0 ? "warning" : "success"}>
          <p>
            {blockedCount > 0
              ? `${blockedCount} package group cannot be packaged yet because service-owned constraints remain visible.`
              : "No blockers are present in this synthetic planning-run response."}
          </p>
        </PlannerAlert>

        <PlannerContentSection
          badge={<PlannerStatusBadge tone="neutral">{recommendationSet.planningRunId}</PlannerStatusBadge>}
          description={`Generated window starts ${formatUtc(recommendationSet.recommendations[0]?.plannedStartUtc)}.`}
          eyebrow="Recommendation detail"
          title={recommendationSet.runNumber}
          titleId="planning-run-recommendations"
          variant="surface"
        >
          <PlannerDataTable
            caption="Planning run recommendation detail"
            columns={recommendationColumns}
            density="compact"
            description={`Use the package row header, readiness, score, hours, constraint state and decision columns to review ${recommendationSet.runNumber}.`}
            emptyState={
              <PlannerEmptyState
                description="The service returned no recommendations for this planning run."
                title="No recommendations"
              />
            }
            getRowKey={(recommendation) => recommendation.packageId}
            rows={recommendationSet.recommendations}
          />
        </PlannerContentSection>
      </PlannerPage>
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
