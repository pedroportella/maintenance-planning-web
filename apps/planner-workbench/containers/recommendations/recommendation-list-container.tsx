import {
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
  type PlannerDecisionRecord,
  type PlannerRecommendation
} from "@maintenance-planning/services";
import { getWorkbenchSection } from "@maintenance-planning/utils";
import Link from "next/link";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import {
  buildRecommendationMetrics,
  formatHours,
  isBlockedRecommendation,
  latestDecisionText,
  toneForDecision,
  toneForReadiness,
  toneForStatus
} from "@/lib/planner-format";
import { RecommendationDecisionNotice } from "./recommendation-notices";
import type { RecommendationSearchParams } from "./recommendation-search-params";
import { packageRecommendationHref } from "./recommendation-links";

type RecommendationListContainerProps = {
  searchParams?: Promise<RecommendationSearchParams>;
};

function buildPackageColumns(
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
            aria-label={`Open package ${recommendation.packageNumber}`}
            href={packageRecommendationHref(recommendation.packageId, { planningRunId })}
          >
            {recommendation.packageNumber}
          </Link>
        }
      />
    ),
    rowHeader: true
  },
  {
    header: "Status",
    key: "status",
    render: (recommendation) => (
      <PlannerBadgeGroup>
        <PlannerStatusBadge tone={toneForStatus(recommendation.status)}>
          {recommendation.status}
        </PlannerStatusBadge>
        <PlannerStatusBadge tone={toneForReadiness(recommendation.sourceDataReadiness.status)}>
          {recommendation.sourceDataReadiness.status}
        </PlannerStatusBadge>
      </PlannerBadgeGroup>
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
    align: "end",
    header: "Blockers",
    key: "blockers",
    render: (recommendation) => recommendation.blockers.length
  },
  {
    align: "end",
    header: "Work orders",
    key: "work-orders",
    render: (recommendation) => recommendation.workOrders.length
  },
  {
    header: "Latest decision",
    key: "decision",
    render: (recommendation) => {
      const decision = latestDecision(recommendation);

      return (
        <PlannerStatusBadge tone={toneForDecision(decision?.decision)}>
          {latestDecisionText(decision)}
        </PlannerStatusBadge>
      );
    }
  },
  {
    header: "Detail",
    key: "detail",
    render: (recommendation) => (
      <Link
        aria-label={`Open package detail for ${recommendation.packageNumber}`}
        href={packageRecommendationHref(recommendation.packageId, { planningRunId })}
      >
        Open package
      </Link>
    )
  }
  ];
}

export default async function RecommendationListContainer({
  searchParams
}: RecommendationListContainerProps) {
  const section = getWorkbenchSection("recommendations");
  const params = (await searchParams) ?? {};

  try {
    const services = createPlannerServices();
    const runtime = services.getRuntimeInfo();
    const recommendationSet = await services.getRecommendationSet();
    const blockedCount = recommendationSet.recommendations.filter(isBlockedRecommendation).length;
    const packageColumns = buildPackageColumns(recommendationSet.planningRunId);

    return (
      <PlannerPage>
        <PlannerPageHeader
          actions={
            <PlannerActionLink asChild>
              <Link href={`/planning-runs/${recommendationSet.planningRunId}`}>
                Open planning run
              </Link>
            </PlannerActionLink>
          }
          badge={
            <PlannerBadgeGroup>
              <PlannerStatusBadge tone={toneForStatus(recommendationSet.status)}>
                {recommendationSet.status}
              </PlannerStatusBadge>
              <PlannerStatusBadge tone="neutral">{runtime.mode} mode</PlannerStatusBadge>
            </PlannerBadgeGroup>
          }
          description="Scan package recommendations before opening one package for explanation, blockers, work orders and planner decision."
          title={section.label}
        />

        <PlannerMetricSummary
          ariaLabel="Recommendation workbench summary"
          items={buildRecommendationMetrics(recommendationSet)}
          variant="compact"
        />

        <RecommendationDecisionNotice params={params} />

        {blockedCount > 0 ? (
          <PlannerAlert title="Decision review scope" tone="warning">
            <p>
              Some package groups cannot be packaged yet. Open a package to review blockers and
              record an accept, reject or defer decision through the service boundary.
            </p>
          </PlannerAlert>
        ) : (
          <PlannerQuietNote title="Decision review scope">
            All package groups in this synthetic response are ready for planner decision review.
          </PlannerQuietNote>
        )}

        <PlannerContentSection
          badge={
            <PlannerStatusBadge tone="neutral">
              {recommendationSet.recommendations.length} packages
            </PlannerStatusBadge>
          }
          description={`${recommendationSet.runNumber} is the current service-supplied planning run.`}
          eyebrow="Package recommendations"
          title="Package queue"
          titleId="recommendation-queue"
          variant="surface"
        >
          <PlannerDataTable
            caption="Package recommendation queue"
            columns={packageColumns}
            density="compact"
            description="Use the package row header, status, score, hours, blocker count, work-order count and latest decision columns before opening a package detail route."
            emptyState={
              <PlannerEmptyState
                description="The service returned no package recommendations for this planning run."
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
        description="The recommendation route reads package recommendations through the planner service boundary."
        error={error}
        title={section.label}
      />
    );
  }
}

function latestDecision(
  recommendation: PlannerRecommendation
): PlannerDecisionRecord | undefined {
  return recommendation.decisions.at(-1);
}
