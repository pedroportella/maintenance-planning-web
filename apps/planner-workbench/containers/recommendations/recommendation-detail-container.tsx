import {
  PlannerActionGroup,
  PlannerActionLink,
  PlannerBadgeGroup,
  PlannerContentSection,
  PlannerEmptyState,
  PlannerPage,
  PlannerPageHeader,
  PlannerStatusBadge
} from "@maintenance-planning/ui-library";
import {
  createPlannerServices,
  type PlannerRecommendationSet,
  type PlannerRuntimeInfo
} from "@maintenance-planning/services";
import { getWorkbenchSection } from "@maintenance-planning/utils";
import Link from "next/link";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import { recommendationStateBadgeSpecs } from "@/lib/planner-format";
import { RecommendationDetailPanel } from "./recommendation-detail-panel";
import { RecommendationDecisionNotice } from "./recommendation-notices";
import { isChangeDecisionRequested } from "./recommendation-decision-state";
import {
  readRecommendationSearchParam,
  type RecommendationSearchParams
} from "./recommendation-search-params";

type RecommendationDetailContainerProps = {
  params: Promise<{
    packageId: string;
  }>;
  searchParams?: Promise<RecommendationSearchParams>;
};

export default async function RecommendationDetailContainer({
  params,
  searchParams
}: RecommendationDetailContainerProps) {
  const { packageId } = await params;
  const queryParams = (await searchParams) ?? {};
  const planningRunId = readRecommendationSearchParam(queryParams, "planningRunId");

  try {
    const services = createPlannerServices();
    const runtime = services.getRuntimeInfo();
    const recommendationSet = await services.getRecommendationSet(
      planningRunId
        ? {
            createRunIfMissing: false,
            planningRunId
          }
        : undefined
    );
    const recommendation = recommendationSet.recommendations.find(
      (candidate) => candidate.packageId === packageId
    );

    if (!recommendation) {
      return (
        <RecommendationNotFound
          packageId={packageId}
          recommendationSet={recommendationSet}
          runtime={runtime}
        />
      );
    }

    return (
      <PlannerPage>
        <PlannerPageHeader
          actions={
            <PlannerActionGroup>
              <PlannerActionLink asChild>
                <Link href="/recommendations">
                Back to recommendations
                </Link>
              </PlannerActionLink>
              <PlannerActionLink asChild priority="secondary">
                <Link href={`/planning-runs/${recommendationSet.planningRunId}`}>
                Open planning run
                </Link>
              </PlannerActionLink>
            </PlannerActionGroup>
          }
          badge={
            <PlannerBadgeGroup align="end">
              {recommendationStateBadgeSpecs(recommendation).map((badge) => (
                <PlannerStatusBadge key={badge.id} tone={badge.tone}>
                  {badge.label}
                </PlannerStatusBadge>
              ))}
              <PlannerStatusBadge tone="neutral">{runtime.mode} mode</PlannerStatusBadge>
            </PlannerBadgeGroup>
          }
          description={`Review ${recommendation.title} from ${recommendationSet.runNumber}.`}
          title={recommendation.packageNumber}
        />

        <RecommendationDecisionNotice params={queryParams} />

        <RecommendationDetailPanel
          isChangingDecision={isChangeDecisionRequested(queryParams)}
          planningRunId={recommendationSet.planningRunId}
          recommendation={recommendation}
        />
      </PlannerPage>
    );
  } catch (error) {
    return (
      <PlannerRouteFailure
        description="The package recommendation detail route loads one package through the server-side planner service boundary."
        error={error}
        title="Package recommendation"
      />
    );
  }
}

function RecommendationNotFound({
  packageId,
  recommendationSet,
  runtime
}: {
  packageId: string;
  recommendationSet: PlannerRecommendationSet;
  runtime: PlannerRuntimeInfo;
}) {
  const section = getWorkbenchSection("recommendations");

  return (
    <PlannerPage>
      <PlannerPageHeader
        actions={
          <PlannerActionGroup>
            <PlannerActionLink asChild>
              <Link href="/recommendations">
              Back to recommendations
              </Link>
            </PlannerActionLink>
            <PlannerActionLink asChild priority="secondary">
              <Link href={`/planning-runs/${recommendationSet.planningRunId}`}>
              Open planning run
              </Link>
            </PlannerActionLink>
          </PlannerActionGroup>
        }
        badge={
          <PlannerBadgeGroup align="end">
            <PlannerStatusBadge tone="warning">Not found</PlannerStatusBadge>
            <PlannerStatusBadge tone="neutral">{runtime.mode} mode</PlannerStatusBadge>
          </PlannerBadgeGroup>
        }
        description={`No package recommendation matched ${packageId} in ${recommendationSet.runNumber}.`}
        title="Package recommendation not found"
      />
      <PlannerContentSection variant="surface">
        <PlannerEmptyState
          description={`Open ${section.label.toLowerCase()} and choose a package from the current synthetic planning run. Visible package numbers are labels; package detail links use stable package ids.`}
          title="Package could not be found"
          tone="critical"
        />
      </PlannerContentSection>
    </PlannerPage>
  );
}
