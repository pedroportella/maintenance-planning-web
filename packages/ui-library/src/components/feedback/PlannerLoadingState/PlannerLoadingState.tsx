import { joinClasses } from "../../../utils";
import { RadixSkeleton, RadixSpinner, RadixText } from "../../radix";

const defaultSkeletonWidths = ["76%", "92%", "58%"] as const;

export type PlannerLoadingStateProps = {
  className?: string;
  label?: string;
  skeletonRows?: number | readonly string[];
};

function getSkeletonRows(skeletonRows: PlannerLoadingStateProps["skeletonRows"]) {
  if (typeof skeletonRows !== "number") {
    return skeletonRows ? [...skeletonRows] : [];
  }

  if (skeletonRows < 1) {
    return [];
  }

  return Array.from({ length: skeletonRows }, (_, index) => {
    return defaultSkeletonWidths[index % defaultSkeletonWidths.length];
  });
}

export function PlannerLoadingState({
  className,
  label = "Loading",
  skeletonRows = 0
}: PlannerLoadingStateProps) {
  const rows = getSkeletonRows(skeletonRows);

  return (
    <div
      aria-busy="true"
      className={joinClasses("planner-loading-state", className)}
      role="status"
    >
      <span className="planner-loading-state-message">
        <RadixSpinner aria-hidden="true" className="planner-loading-state-spinner" size="2" />
        <RadixText as="span" className="planner-loading-state-label" tone="muted" weight="bold">
          {label}
        </RadixText>
      </span>
      {rows.length > 0 ? (
        <div className="planner-loading-state-skeleton" aria-hidden="true">
          {rows.map((width, index) => (
            <RadixSkeleton
              className="planner-loading-state-skeleton-row"
              height="18px"
              key={`${width}-${index}`}
              width={width}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
