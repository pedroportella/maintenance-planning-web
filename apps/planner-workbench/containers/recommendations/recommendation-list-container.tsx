import {
  Alert,
  DataTable,
  EmptyState,
  MetricSummary,
  PageHeader,
  StatusBadge,
  WorkbenchPanel,
  type DataTableColumn
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
import {
  RecommendationDecisionNotice,
  type RecommendationSearchParams
} from "./recommendation-notices";
import { packageRecommendationHref } from "./recommendation-links";

type RecommendationListContainerProps = {
  searchParams?: Promise<RecommendationSearchParams>;
};

function buildPackageColumns(
  planningRunId: string
): readonly DataTableColumn<PlannerRecommendation>[] {
  return [
  {
    header: "Package",
    key: "package",
    render: (recommendation) => (
      <span className="table-stack">
        <strong>{recommendation.packageNumber}</strong>
        <span>{recommendation.title}</span>
      </span>
    )
  },
  {
    header: "Status",
    key: "status",
    render: (recommendation) => (
      <span className="badge-stack">
        <StatusBadge tone={toneForStatus(recommendation.status)}>
          {recommendation.status}
        </StatusBadge>
        <StatusBadge tone={toneForReadiness(recommendation.sourceDataReadiness.status)}>
          {recommendation.sourceDataReadiness.status}
        </StatusBadge>
      </span>
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
        <StatusBadge tone={toneForDecision(decision?.decision)}>
          {latestDecisionText(decision)}
        </StatusBadge>
      );
    }
  },
  {
    header: "Detail",
    key: "detail",
    render: (recommendation) => (
      <Link
        className="table-link"
        href={packageRecommendationHref(recommendation.packageId, { planningRunId })}
      >
        Open package
        <span className="sr-only"> {recommendation.packageNumber}</span>
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
      <main className="page-stack">
        <PageHeader
          actions={
            <Link className="primary-link" href={`/planning-runs/${recommendationSet.planningRunId}`}>
              Open planning run
            </Link>
          }
          badge={
            <span className="badge-stack">
              <StatusBadge tone={toneForStatus(recommendationSet.status)}>
                {recommendationSet.status}
              </StatusBadge>
              <StatusBadge tone="neutral">{runtime.mode} mode</StatusBadge>
            </span>
          }
          description="Scan package recommendations before opening one package for explanation, blockers, work orders and planner decision."
          title={section.label}
        />

        <MetricSummary
          ariaLabel="Recommendation workbench summary"
          items={buildRecommendationMetrics(recommendationSet)}
        />

        <RecommendationDecisionNotice params={params} />

        <Alert title="Decision review scope" tone={blockedCount > 0 ? "warning" : "success"}>
          <p>
            {blockedCount > 0
              ? "Some package groups cannot be packaged yet. Open a package to review blockers and record an accept, reject or defer decision through the service boundary."
              : "All package groups in this synthetic response are ready for planner decision review."}
          </p>
        </Alert>

        <WorkbenchPanel className="console-panel" labelledBy="recommendation-queue">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Package recommendations</p>
              <h2 id="recommendation-queue">Package queue</h2>
              <p>{recommendationSet.runNumber} is the current service-supplied planning run.</p>
            </div>
            <StatusBadge tone="neutral">
              {recommendationSet.recommendations.length} packages
            </StatusBadge>
          </div>
          <DataTable
            caption="Package recommendation queue"
            columns={packageColumns}
            emptyState={
              <EmptyState
                description="The service returned no package recommendations for this planning run."
                title="No recommendations"
              />
            }
            getRowKey={(recommendation) => recommendation.packageId}
            rows={recommendationSet.recommendations}
          />
        </WorkbenchPanel>
      </main>
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
