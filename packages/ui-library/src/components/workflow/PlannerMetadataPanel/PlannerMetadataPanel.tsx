import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";
import {
  PlannerSummaryList,
  type PlannerSummaryListItem,
  type PlannerSummaryListProps
} from "../../data";

type PlannerMetadataPanelElement = "article" | "aside" | "section";

export type PlannerMetadataPanelProps = {
  as?: PlannerMetadataPanelElement;
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
  density?: "compact" | "standard";
  description?: ReactNode;
  eyebrow?: ReactNode;
  items: readonly PlannerSummaryListItem[];
  summaryAriaLabel?: string;
  summaryOrientation?: PlannerSummaryListProps["orientation"];
  title?: ReactNode;
  titleId?: string;
};

export function PlannerMetadataPanel({
  as = "section",
  badge,
  children,
  className,
  density = "standard",
  description,
  eyebrow,
  items,
  summaryAriaLabel,
  summaryOrientation,
  title,
  titleId
}: PlannerMetadataPanelProps) {
  const Component = as;
  const hasHeader = Boolean(title || description || eyebrow || badge);

  return (
    <Component
      aria-labelledby={title ? titleId : undefined}
      className={joinClasses("planner-metadata-panel", className)}
      data-density={density}
    >
      {hasHeader ? (
        <header className="planner-metadata-panel-header">
          <div className="planner-metadata-panel-copy">
            {eyebrow ? <p className="planner-metadata-panel-eyebrow">{eyebrow}</p> : null}
            {title ? <h3 id={titleId}>{title}</h3> : null}
            {description ? (
              <p className="planner-metadata-panel-description">{description}</p>
            ) : null}
          </div>
          {badge ? <div className="planner-metadata-panel-badge">{badge}</div> : null}
        </header>
      ) : null}
      <PlannerSummaryList
        ariaLabel={summaryAriaLabel}
        items={items}
        orientation={summaryOrientation}
        variant={density === "compact" ? "compact" : "standard"}
      />
      {children ? <div className="planner-metadata-panel-body">{children}</div> : null}
    </Component>
  );
}
