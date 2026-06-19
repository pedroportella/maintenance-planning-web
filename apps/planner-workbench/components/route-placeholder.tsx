import { MetricCard, StatusPill, WorkbenchPanel } from "@maintenance-planning/ui-library";
import { getWorkbenchSection, type WorkbenchSectionSlug } from "@maintenance-planning/utils";

type RoutePlaceholderProps = {
  slug: WorkbenchSectionSlug;
};

export function RoutePlaceholder({ slug }: RoutePlaceholderProps) {
  const section = getWorkbenchSection(slug);

  return (
    <main className="page-stack">
      <WorkbenchPanel className="queue-intro">
        <div>
          <StatusPill tone={section.tone === "critical" ? "info" : section.tone}>
            Placeholder task shell
          </StatusPill>
          <h1>{section.label}</h1>
          <p>{section.summary}</p>
        </div>
      </WorkbenchPanel>

      <section className="route-grid" aria-label={`${section.label} route details`}>
        <MetricCard
          detail={section.metric.detail}
          label={section.metric.label}
          tone={section.metric.tone}
          value={section.metric.value}
        />

        <article className="route-card">
          <p className="eyebrow">Planner focus</p>
          <h2>{section.placeholderTitle}</h2>
          <p>{section.placeholderBody}</p>
          <ul>
            {section.placeholderTasks.map((task) => (
              <li className="queue-item" key={task.label}>
                <span>
                  <strong>{task.label}</strong>
                  <span>{task.detail}</span>
                </span>
                <StatusPill tone={task.tone}>{task.status}</StatusPill>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
