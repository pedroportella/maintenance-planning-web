import { workbenchIconNames } from "@maintenance-planning/ui-assets";
import { MetricCard, StatusPill, WorkbenchPanel } from "@maintenance-planning/ui-library";
import {
  getPrimaryCoordinationSection,
  plannerSummaryItems,
  workbenchSections
} from "@maintenance-planning/utils";
import Link from "next/link";
import { getLucideIcon } from "@/components/lucide-icon";

export default function HomePage() {
  const primarySection = getPrimaryCoordinationSection();
  const prioritySections = workbenchSections.slice(0, 3);
  const ForwardIcon = getLucideIcon(workbenchIconNames.actions.forward);
  const ReviewIcon = getLucideIcon(workbenchIconNames.actions.review);

  return (
    <main className="page-stack">
      <WorkbenchPanel className="queue-intro">
        <div>
          <StatusPill tone="info">Synthetic placeholders</StatusPill>
          <h1>Planner queue</h1>
          <p>
            Review the coordination items that need planner attention before the next
            recommendation view is connected to service data.
          </p>
        </div>
        <Link className="primary-link" href={primarySection.path}>
          <ReviewIcon aria-hidden="true" size={18} />
          Review coordination
          <ForwardIcon aria-hidden="true" size={16} />
        </Link>
      </WorkbenchPanel>

      <section className="metric-grid" aria-label="Planner summary">
        {plannerSummaryItems.map((item) => (
          <MetricCard
            key={item.label}
            detail={item.detail}
            label={item.label}
            tone={item.tone}
            value={item.value}
          />
        ))}
      </section>

      <WorkbenchPanel>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Next to coordinate</p>
            <h2>Task shells</h2>
          </div>
          <StatusPill tone="neutral">No backend required</StatusPill>
        </div>
        <div className="task-grid">
          {prioritySections.map((section) => (
            <Link className="task-card" href={section.path} key={section.slug}>
              <span className={`task-accent task-accent-${section.tone}`} aria-hidden="true" />
              <span>
                <strong>{section.label}</strong>
                <small>{section.coordinationCue}</small>
              </span>
              <ForwardIcon aria-hidden="true" size={16} />
            </Link>
          ))}
        </div>
      </WorkbenchPanel>
    </main>
  );
}
