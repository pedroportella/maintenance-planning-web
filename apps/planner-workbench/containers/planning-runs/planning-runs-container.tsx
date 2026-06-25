import {
  PlannerActionLink,
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
  type PlannerRecommendationSet
} from "@maintenance-planning/services";
import { getWorkbenchSection } from "@maintenance-planning/utils";
import Link from "next/link";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import {
  buildPlanningRunMetrics,
  isBlockedRecommendation,
  isReadyRecommendation,
  toneForStatus
} from "@/lib/planner-format";

type PlanningRunRow = {
  readonly blockedCount: number;
  readonly id: string;
  readonly packageCount: number;
  readonly readyCount: number;
  readonly runNumber: string;
  readonly status: string;
};

const planningRunColumns: readonly PlannerDataTableColumn<PlanningRunRow>[] = [
  {
    header: "Run",
    key: "run",
    render: (run) => (
      <PlannerTableCellStack detail={run.id} title={run.runNumber} />
    ),
    rowHeader: true
  },
  {
    header: "Status",
    key: "status",
    render: (run) => (
      <PlannerStatusBadge tone={toneForStatus(run.status)}>{run.status}</PlannerStatusBadge>
    )
  },
  {
    align: "end",
    header: "Packages",
    key: "packages",
    render: (run) => run.packageCount
  },
  {
    align: "end",
    header: "Ready",
    key: "ready",
    render: (run) => run.readyCount
  },
  {
    align: "end",
    header: "Blocked",
    key: "blocked",
    render: (run) => run.blockedCount
  },
  {
    header: "Detail",
    key: "detail",
    render: (run) => (
      <Link href={`/planning-runs/${run.id}`}>
        Open run
      </Link>
    )
  }
];

export default async function PlanningRunsPage() {
  const section = getWorkbenchSection("planning-runs");

  try {
    const services = createPlannerServices();
    const runtime = services.getRuntimeInfo();
    const recommendationSet = await services.getRecommendationSet();
    const rows = [toPlanningRunRow(recommendationSet)];

    return (
      <PlannerPage>
        <PlannerPageHeader
          badge={
            <PlannerBadgeGroup>
              <PlannerStatusBadge tone="success">Run review</PlannerStatusBadge>
              <PlannerStatusBadge tone="neutral">{runtime.mode} mode</PlannerStatusBadge>
            </PlannerBadgeGroup>
          }
          description="Inspect the current service-supplied planning run before opening the recommendation detail."
          title={section.label}
        />

        <PlannerMetricSummary
          ariaLabel="Planning run summary"
          items={buildPlanningRunMetrics(recommendationSet)}
          variant="compact"
        />

        <PlannerQuietNote title="Run list scope">
          This view lists the current synthetic planning run exposed by the service contract.
          Historical run browsing is left to a later API-backed stage.
        </PlannerQuietNote>

        <PlannerContentSection
          actions={
            <PlannerActionLink asChild>
              <Link href="/recommendations">Review recommendations</Link>
            </PlannerActionLink>
          }
          eyebrow="Planning runs"
          title="Current run list"
          titleId="planning-run-list"
          variant="surface"
        >
          <PlannerDataTable
            caption="Planning run list"
            columns={planningRunColumns}
            density="compact"
            description="Use the run row header, status, package count, ready count and blocked count before opening a planning-run detail route."
            emptyState={
              <PlannerEmptyState
                description="The service returned no planning runs for this synthetic review state."
                title="No planning runs"
              />
            }
            getRowKey={(run) => run.id}
            rows={rows}
          />
        </PlannerContentSection>
      </PlannerPage>
    );
  } catch (error) {
    return (
      <PlannerRouteFailure
        description="The planning-runs route prepares service-owned run context for planner review."
        error={error}
        title={section.label}
      />
    );
  }
}

function toPlanningRunRow(recommendationSet: PlannerRecommendationSet): PlanningRunRow {
  return {
    blockedCount: recommendationSet.recommendations.filter(isBlockedRecommendation).length,
    id: recommendationSet.planningRunId,
    packageCount: recommendationSet.recommendations.length,
    readyCount: recommendationSet.recommendations.filter(isReadyRecommendation).length,
    runNumber: recommendationSet.runNumber,
    status: recommendationSet.status
  };
}
