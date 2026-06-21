import { workbenchIconNames } from "@maintenance-planning/ui-assets";
import {
  PageHeader,
  QuietNote,
  StatusBadge,
  WorkbenchPanel
} from "@maintenance-planning/ui-library";
import {
  getPrimaryCoordinationSection,
  getWorkbenchSection
} from "@maintenance-planning/utils";
import Link from "next/link";
import { getLucideIcon } from "@/components/lucide-icon";

export default function HomePage() {
  const primarySection = getPrimaryCoordinationSection();
  const backlogSection = getWorkbenchSection("work-order-backlog");
  const postureSection = getWorkbenchSection("operations-posture");
  const scenariosSection = getWorkbenchSection("scenario-outcomes");
  const ForwardIcon = getLucideIcon(workbenchIconNames.actions.forward);
  const ReviewIcon = getLucideIcon(workbenchIconNames.actions.review);

  return (
    <main className="page-stack page-stack-compact">
      <PageHeader
        actions={
          <Link className="primary-link" href={primarySection.path}>
            <ReviewIcon aria-hidden="true" size={18} />
            Review recommendations
            <ForwardIcon aria-hidden="true" size={16} />
          </Link>
        }
        badge={<StatusBadge tone="neutral">Synthetic review</StatusBadge>}
        description="Start with package recommendations, then use work-order triage and evidence pages when a decision needs more context."
        title="Planner Workbench"
      />

      <QuietNote title="Local review boundary">
        Synthetic data is read through the server-side planner service boundary. This page does not
        claim live source-system connectivity or production operations evidence.
      </QuietNote>

      <WorkbenchPanel className="console-panel launch-panel" labelledBy="launch-primary">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Primary workflow</p>
            <h2 id="launch-primary">Review package decisions</h2>
            <p>{primarySection.coordinationCue}</p>
          </div>
          <StatusBadge tone={primarySection.tone}>Start here</StatusBadge>
        </div>

        <Link className="primary-link launch-primary-link" href={primarySection.path}>
          <ReviewIcon aria-hidden="true" size={18} />
          Open recommendations
          <ForwardIcon aria-hidden="true" size={16} />
        </Link>

        <div className="launch-link-row" aria-label="Supporting workbench routes">
          <Link className="secondary-link" href={backlogSection.path}>
            {backlogSection.label}
          </Link>
          <Link className="secondary-link" href={postureSection.path}>
            {postureSection.label}
          </Link>
          <Link className="secondary-link" href={scenariosSection.path}>
            {scenariosSection.label}
          </Link>
        </div>
      </WorkbenchPanel>
    </main>
  );
}
