import {
  ErrorState,
  PageHeader,
  StatusBadge,
  WorkbenchPanel
} from "@maintenance-planning/ui-library";
import { createPlannerServices } from "@maintenance-planning/services";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import { packageRecommendationHref } from "./recommendation-links";

type RecommendationPackageNumberRedirectProps = {
  params: Promise<{
    packageNumber: string;
  }>;
};

export default async function RecommendationPackageNumberRedirect({
  params
}: RecommendationPackageNumberRedirectProps) {
  const { packageNumber } = await params;
  let redirectPath: string | undefined;

  try {
    const services = createPlannerServices();
    const runtime = services.getRuntimeInfo();
    const recommendationSet = await services.getRecommendationSet();
    const recommendation = recommendationSet.recommendations.find(
      (candidate) => candidate.packageNumber === packageNumber
    );

    if (recommendation) {
      redirectPath = packageRecommendationHref(recommendation.packageId, {
        planningRunId: recommendationSet.planningRunId
      });
    } else {
      return (
        <main className="page-stack">
          <PageHeader
            actions={
              <Link className="primary-link" href="/recommendations">
                Back to recommendations
              </Link>
            }
            badge={
              <span className="badge-stack">
                <StatusBadge tone="warning">Not found</StatusBadge>
                <StatusBadge tone="neutral">{runtime.mode} mode</StatusBadge>
              </span>
            }
            description={`No package recommendation matched ${packageNumber} in ${recommendationSet.runNumber}.`}
            title="Package recommendation not found"
          />
          <WorkbenchPanel>
            <ErrorState
              description="Open recommendations and choose a package from the current synthetic planning run."
              title="Package could not be found"
            />
          </WorkbenchPanel>
        </main>
      );
    }
  } catch (error) {
    return (
      <PlannerRouteFailure
        description="The package-number route resolves a visible package number to the stable package detail route through the server-side planner service boundary."
        error={error}
        title="Package recommendation"
      />
    );
  }

  redirect(redirectPath ?? "/recommendations");
}
