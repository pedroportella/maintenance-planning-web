import {
  PlannerAlert,
  PlannerBadgeGroup,
  PlannerContentSection,
  PlannerMetadataPanel,
  PlannerPlainList,
  PlannerResponsiveGrid,
  PlannerStatusBadge,
  PlannerSummaryList
} from "@maintenance-planning/ui-library";
import type {
  PlannerRecommendation,
  PlannerRecommendationSet
} from "@maintenance-planning/services";
import {
  formatHours,
  toneForReadiness,
  toneForStatus
} from "@/lib/planner-format";

export function RecommendationCardsSection({
  recommendationSet
}: {
  readonly recommendationSet: PlannerRecommendationSet;
}) {
  return recommendationSet.recommendations.length > 0 ? (
    <PlannerContentSection
      badge={
        <PlannerStatusBadge tone={toneForStatus(recommendationSet.status)}>
          {recommendationSet.status}
        </PlannerStatusBadge>
      }
      eyebrow="Component family"
      title="Recommendation cards"
      titleId="showcase-recommendations"
      variant="surface"
    >
      <PlannerResponsiveGrid ariaLabel="Showcase recommendation cards">
        {recommendationSet.recommendations.map((recommendation) => (
          <ShowcaseRecommendationCard
            key={recommendation.packageId}
            recommendation={recommendation}
          />
        ))}
      </PlannerResponsiveGrid>
    </PlannerContentSection>
  ) : null;
}

function ShowcaseRecommendationCard({
  recommendation
}: {
  readonly recommendation: PlannerRecommendation;
}) {
  const titleId = `${recommendation.packageId}-showcase-card`;

  return (
    <PlannerContentSection
      as="article"
      badge={
        <PlannerBadgeGroup align="end">
          <PlannerStatusBadge tone={toneForStatus(recommendation.status)}>
            {recommendation.status}
          </PlannerStatusBadge>
          <PlannerStatusBadge tone={toneForReadiness(recommendation.sourceDataReadiness.status)}>
            {recommendation.sourceDataReadiness.status}
          </PlannerStatusBadge>
        </PlannerBadgeGroup>
      }
      description={recommendation.title}
      eyebrow="Synthetic package recommendation"
      title={recommendation.packageNumber}
      titleId={titleId}
      variant="surface"
    >
      <PlannerResponsiveGrid balance="secondary">
        <PlannerContentSection
          title="Explanation"
          titleId={`${titleId}-explanation`}
        >
          <p>{recommendation.explanation.text}</p>
          <PlannerSummaryList
            ariaLabel={`${recommendation.packageNumber} explanation facts`}
            items={[
              {
                id: "score",
                label: "Score",
                tone: "info",
                value: recommendation.score
              },
              {
                id: "actionability",
                label: "Actionability",
                value: recommendation.actionability
              },
              {
                id: "estimated-work",
                label: "Estimated work",
                value: formatHours(recommendation.estimatedHours)
              }
            ]}
          />
        </PlannerContentSection>

        <PlannerMetadataPanel
          description={recommendation.sourceDataReadiness.summary}
          density="compact"
          items={[
            {
              id: "ready",
              label: "Ready",
              tone: "success",
              value: recommendation.sourceDataReadiness.readyCount
            },
            {
              id: "review",
              label: "Review",
              tone: "warning",
              value: recommendation.sourceDataReadiness.needsReviewCount
            },
            {
              id: "blocked",
              label: "Blocked",
              tone: "critical",
              value: recommendation.sourceDataReadiness.blockedCount
            }
          ]}
          summaryAriaLabel={`${recommendation.packageNumber} readiness facts`}
          title="Readiness"
          titleId={`${recommendation.packageId}-showcase-readiness`}
        />
      </PlannerResponsiveGrid>

      <PlannerAlert
        title={recommendation.blockers.length > 0 ? "Package blockers" : "No package blockers"}
        tone={recommendation.blockers.length > 0 ? "warning" : "success"}
      >
        {recommendation.blockers.length > 0 ? (
          <PlannerPlainList>
            {recommendation.blockers.map((blocker) => (
              <li key={`${blocker.code}-${blocker.workOrderNumbers.join("-")}`}>
                <strong>{blocker.code}</strong>: {blocker.summary}
              </li>
            ))}
          </PlannerPlainList>
        ) : (
          <p>Service-owned constraints do not show a blocker for this package group.</p>
        )}
      </PlannerAlert>
    </PlannerContentSection>
  );
}
