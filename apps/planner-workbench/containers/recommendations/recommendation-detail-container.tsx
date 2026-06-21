import {
  ErrorState,
  PageHeader,
  StatusBadge,
  WorkbenchPanel
} from "@maintenance-planning/ui-library";
import {
  createPlannerServices,
  type PlannerRecommendationSet,
  type PlannerRuntimeInfo
} from "@maintenance-planning/services";
import { getWorkbenchSection } from "@maintenance-planning/utils";
import Link from "next/link";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import {
  toneForReadiness,
  toneForStatus
} from "@/lib/planner-format";
import { RecommendationDetailPanel } from "./recommendation-detail-panel";
import {
  RecommendationDecisionNotice,
  readRecommendationSearchParam,
  type RecommendationSearchParams
} from "./recommendation-notices";

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
      <main className="page-stack">
        <PageHeader
          actions={
            <span className="action-row">
              <Link className="primary-link" href="/recommendations">
                Back to recommendations
              </Link>
              <Link className="secondary-link" href={`/planning-runs/${recommendationSet.planningRunId}`}>
                Open planning run
              </Link>
            </span>
          }
          badge={
            <span className="badge-stack">
              <StatusBadge tone={toneForStatus(recommendation.status)}>
                {recommendation.status}
              </StatusBadge>
              <StatusBadge tone={toneForReadiness(recommendation.sourceDataReadiness.status)}>
                {recommendation.sourceDataReadiness.status}
              </StatusBadge>
              <StatusBadge tone="neutral">{runtime.mode} mode</StatusBadge>
            </span>
          }
          description={`Review ${recommendation.title} from ${recommendationSet.runNumber}.`}
          title={recommendation.packageNumber}
        />

        <RecommendationDecisionNotice params={queryParams} />

        <RecommendationDetailPanel
          planningRunId={recommendationSet.planningRunId}
          recommendation={recommendation}
        />
      </main>
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
    <main className="page-stack">
      <PageHeader
        actions={
          <span className="action-row">
            <Link className="primary-link" href="/recommendations">
              Back to recommendations
            </Link>
            <Link className="secondary-link" href={`/planning-runs/${recommendationSet.planningRunId}`}>
              Open planning run
            </Link>
          </span>
        }
        badge={
          <span className="badge-stack">
            <StatusBadge tone="warning">Not found</StatusBadge>
            <StatusBadge tone="neutral">{runtime.mode} mode</StatusBadge>
          </span>
        }
        description={`No package recommendation matched ${packageId} in ${recommendationSet.runNumber}.`}
        title="Package recommendation not found"
      />
      <WorkbenchPanel>
        <ErrorState
          description={`Open ${section.label.toLowerCase()} and choose a package from the current synthetic planning run. Visible package numbers are labels; package detail links use stable package ids.`}
          title="Package could not be found"
        />
      </WorkbenchPanel>
    </main>
  );
}
