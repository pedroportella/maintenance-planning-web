import {
  PlannerActionLink,
  PlannerBadgeGroup,
  PlannerContentSection,
  PlannerEmptyState,
  PlannerPage,
  PlannerPageHeader,
  PlannerStatusBadge
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
        <PlannerPage>
          <PlannerPageHeader
            actions={
              <PlannerActionLink asChild>
                <Link href="/recommendations">Back to recommendations</Link>
              </PlannerActionLink>
            }
            badge={
              <PlannerBadgeGroup align="end">
                <PlannerStatusBadge tone="warning">Not found</PlannerStatusBadge>
                <PlannerStatusBadge tone="neutral">{runtime.mode} mode</PlannerStatusBadge>
              </PlannerBadgeGroup>
            }
            description={`No package recommendation matched ${packageNumber} in ${recommendationSet.runNumber}.`}
            title="Package recommendation not found"
          />
          <PlannerContentSection variant="surface">
            <PlannerEmptyState
              description="Open recommendations and choose a package from the current synthetic planning run."
              title="Package could not be found"
              tone="critical"
            />
          </PlannerContentSection>
        </PlannerPage>
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
