import type { Metadata } from "next";
import {
  PlannerAlert,
  PlannerBadgeGroup,
  PlannerPage,
  PlannerPageHeader,
  PlannerStatusBadge
} from "@maintenance-planning/ui-library";
import { createPlannerServices } from "@maintenance-planning/services";
import { isReadyRecommendation } from "@/lib/planner-format";
import { AlertsBadgesSection } from "./_components/alerts-badges-section";
import { DecisionActionsSection } from "./_components/decision-actions-section";
import { LayoutTemplatesSection } from "./_components/layout-templates-section";
import { MetadataListsSection } from "./_components/metadata-lists-section";
import { OperationsPostureSection } from "./_components/operations-posture-section";
import { RadixAdaptersSection } from "./_components/radix-adapters-section";
import { RecommendationCardsSection } from "./_components/recommendation-cards-section";
import { StatesSection } from "./_components/states-section";
import { TablesSection } from "./_components/tables-section";
import { ThemeFoundationSection } from "./_components/theme-foundation-section";

export const metadata: Metadata = {
  title: "UI Library Evidence | Planner Workbench",
  description: "Reviewer and developer evidence for synthetic planner workbench UI states.",
  robots: {
    follow: false,
    index: false
  }
};

export const dynamic = "force-static";

export default async function UiLibraryPage() {
  const partsDelayServices = createPlannerServices({
    config: {
      mockScenarioId: "parts-delay-replan",
      mode: "mock"
    }
  });

  const [recommendationSet, backlog, posture, sourceReadiness, scenarioSummary] =
    await Promise.all([
      partsDelayServices.getRecommendationSet(),
      partsDelayServices.getWorkOrderBacklog(),
      partsDelayServices.getOperationsPosture(),
      partsDelayServices.getSourceDataReadiness(),
      partsDelayServices.getScenarioOutcomeSummary()
    ]);
  const readyDecisionRecommendation =
    recommendationSet.recommendations.find((recommendation) => isReadyRecommendation(recommendation)) ??
    recommendationSet.recommendations[0];
  const blockedDecisionRecommendation =
    recommendationSet.recommendations.find((recommendation) => !isReadyRecommendation(recommendation)) ??
    readyDecisionRecommendation;

  return (
    <PlannerPage id="ui-library-main" labelledBy="ui-library-title">
      <PlannerPageHeader
        badge={
          <PlannerBadgeGroup>
            <PlannerStatusBadge tone="info">Reviewer evidence</PlannerStatusBadge>
            <PlannerStatusBadge tone="neutral">Static mock data</PlannerStatusBadge>
          </PlannerBadgeGroup>
        }
        description="Focused visual and accessibility evidence for reusable synthetic planner workbench states."
        eyebrow="Developer route"
        title="UI library showcase"
        titleId="ui-library-title"
      />

      <PlannerAlert title="Route scope" tone="info">
        <p>
          This page is an internal reviewer and developer aid. It uses checked synthetic fixtures
          and does not call a backend service.
        </p>
      </PlannerAlert>

      <ThemeFoundationSection />
      <RadixAdaptersSection />
      <LayoutTemplatesSection />
      <AlertsBadgesSection />
      <MetadataListsSection />
      {readyDecisionRecommendation && blockedDecisionRecommendation ? (
        <DecisionActionsSection
          blockedDecisionRecommendation={blockedDecisionRecommendation}
          planningRunId={recommendationSet.planningRunId}
          readyDecisionRecommendation={readyDecisionRecommendation}
        />
      ) : null}
      <TablesSection backlog={backlog} posture={posture} />
      <StatesSection />
      <RecommendationCardsSection recommendationSet={recommendationSet} />
      <OperationsPostureSection
        posture={posture}
        scenarioSummary={scenarioSummary}
        sourceReadiness={sourceReadiness}
      />
    </PlannerPage>
  );
}
