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

export const dynamic = "force-dynamic";

type PlanningRunRow = {
  readonly blockedCount: number;
  readonly id: string;
  readonly packageCount: number;
  readonly readyCount: number;
  readonly runNumber: string;
  readonly status: string;
};

const planningRunColumns: readonly DataTableColumn<PlanningRunRow>[] = [
  {
    header: "Run",
    key: "run",
    render: (run) => (
      <span className="table-stack">
        <strong>{run.runNumber}</strong>
        <span>{run.id}</span>
      </span>
    )
  },
  {
    header: "Status",
    key: "status",
    render: (run) => <StatusBadge tone={toneForStatus(run.status)}>{run.status}</StatusBadge>
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
      <Link className="table-link" href={`/planning-runs/${run.id}`}>
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
      <main className="page-stack">
        <PageHeader
          badge={
            <span className="badge-stack">
              <StatusBadge tone="success">Run review</StatusBadge>
              <StatusBadge tone="neutral">{runtime.mode} mode</StatusBadge>
            </span>
          }
          description="Inspect the current service-supplied planning run before opening the recommendation detail."
          title={section.label}
        />

        <MetricSummary
          ariaLabel="Planning run summary"
          items={buildPlanningRunMetrics(recommendationSet)}
        />

        <Alert title="Run list scope" tone="info">
          <p>
            This view lists the current synthetic planning run exposed by the service contract.
            Historical run browsing is left to a later API-backed stage.
          </p>
        </Alert>

        <WorkbenchPanel className="console-panel" labelledBy="planning-run-list">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Planning runs</p>
              <h2 id="planning-run-list">Current run list</h2>
            </div>
            <Link className="primary-link" href="/recommendations">
              Review recommendations
            </Link>
          </div>
          <DataTable
            caption="Planning run list"
            columns={planningRunColumns}
            emptyState={
              <EmptyState
                description="The service returned no planning runs for this synthetic review state."
                title="No planning runs"
              />
            }
            getRowKey={(run) => run.id}
            rows={rows}
          />
        </WorkbenchPanel>
      </main>
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
