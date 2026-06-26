import {
  PlannerContentSection,
  PlannerDecisionPanel,
  PlannerResponsiveGrid,
  PlannerStatusBadge,
  RadixLink
} from "@maintenance-planning/ui-library";
import type { PlannerRecommendation } from "@maintenance-planning/services";
import {
  buildShowcaseDecisionActions,
  buildShowcaseDecisionBlockers,
  buildShowcaseDecisionFacts
} from "./showcase-fixtures";

export function DecisionActionsSection({
  blockedDecisionRecommendation,
  planningRunId,
  readyDecisionRecommendation
}: {
  readonly blockedDecisionRecommendation: PlannerRecommendation;
  readonly planningRunId: string;
  readonly readyDecisionRecommendation: PlannerRecommendation;
}) {
  return (
    <PlannerContentSection
      badge={<PlannerStatusBadge tone="success">RU6</PlannerStatusBadge>}
      eyebrow="Component family"
      title="Decision action surfaces"
      titleId="showcase-decision-actions"
      variant="surface"
    >
      <PlannerResponsiveGrid>
        <PlannerDecisionPanel
          actions={buildShowcaseDecisionActions(readyDecisionRecommendation)}
          blockers={buildShowcaseDecisionBlockers(readyDecisionRecommendation)}
          facts={buildShowcaseDecisionFacts(readyDecisionRecommendation)}
          packageId={readyDecisionRecommendation.packageId}
          packageNumber={readyDecisionRecommendation.packageNumber}
          planningRunId={planningRunId}
          recordAction="/ui-library"
          secondaryAction={<RadixLink href="/recommendations">Back to queue</RadixLink>}
          title="Ready package decision"
          titleId="showcase-ready-decision"
          workOrderIds={readyDecisionRecommendation.workOrders.map((workOrder) => workOrder.id)}
        />
        <PlannerDecisionPanel
          actions={buildShowcaseDecisionActions(blockedDecisionRecommendation)}
          blockers={buildShowcaseDecisionBlockers(blockedDecisionRecommendation)}
          facts={buildShowcaseDecisionFacts(blockedDecisionRecommendation)}
          packageId={blockedDecisionRecommendation.packageId}
          packageNumber={blockedDecisionRecommendation.packageNumber}
          planningRunId={planningRunId}
          recordAction="/ui-library"
          secondaryAction={<RadixLink href="/work-order-backlog">Review work orders</RadixLink>}
          title="Blocked package decision"
          titleId="showcase-blocked-decision"
          workOrderIds={blockedDecisionRecommendation.workOrders.map((workOrder) => workOrder.id)}
        />
      </PlannerResponsiveGrid>
    </PlannerContentSection>
  );
}
