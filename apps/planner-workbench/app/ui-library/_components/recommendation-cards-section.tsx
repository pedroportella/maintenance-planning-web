import {
  PlannerAlert,
  PlannerBadgeGroup,
  PlannerContentSection,
  PlannerEvidenceAccordion,
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
      <PlannerEvidenceAccordion
        ariaLabel={`${recommendation.packageNumber} grouped recommendation evidence`}
        defaultValue={["recommendation-explanation"]}
        items={[
          {
            badge: (
              <PlannerStatusBadge tone="info">
                Score {recommendation.score}
              </PlannerStatusBadge>
            ),
            children: (
              <>
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
              </>
            ),
            summary: `${formatHours(recommendation.estimatedHours)} across ${recommendation.workOrders.length} work orders.`,
            title: "Why this package",
            value: "recommendation-explanation"
          },
          {
            badge: (
              <PlannerStatusBadge tone={toneForReadiness(recommendation.sourceDataReadiness.status)}>
                {recommendation.sourceDataReadiness.status}
              </PlannerStatusBadge>
            ),
            children: (
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
              />
            ),
            summary: recommendation.sourceDataReadiness.summary,
            title: "Source-data readiness",
            value: "source-readiness"
          },
          {
            badge: recommendation.blockers.length > 0 ? (
              <PlannerStatusBadge tone="warning">
                {recommendation.blockers.length} active
              </PlannerStatusBadge>
            ) : (
              <PlannerStatusBadge tone="success">None</PlannerStatusBadge>
            ),
            children: (
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
            ),
            summary:
              recommendation.blockers.length > 0
                ? "Review the active acceptance blockers."
                : "No package blockers in this fixture.",
            title: `Blockers (${recommendation.blockers.length})`,
            value: "blockers"
          }
        ]}
        type="multiple"
      />
    </PlannerContentSection>
  );
}
