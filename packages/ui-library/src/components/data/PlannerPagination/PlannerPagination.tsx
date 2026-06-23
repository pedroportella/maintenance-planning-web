import { joinClasses } from "../../../utils";
import { RadixIcon, RadixIconButton, RadixText } from "../../radix";

export type PlannerPaginationProps = {
  ariaLabel?: string;
  className?: string;
  currentPage: number;
  hrefForPage?: (page: number) => string;
  onPageChange?: (page: number) => void;
  pageSize: number;
  totalItems: number;
};

export function PlannerPagination({
  ariaLabel = "Table pagination",
  className,
  currentPage,
  hrefForPage,
  onPageChange,
  pageSize,
  totalItems
}: PlannerPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));
  const safePage = Math.min(Math.max(currentPage, 1), pageCount);
  const rangeStart = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(totalItems, safePage * pageSize);
  const canGoBack = safePage > 1;
  const canGoForward = safePage < pageCount;

  return (
    <nav
      aria-label={ariaLabel}
      className={joinClasses("planner-pagination", className)}
    >
      <RadixText
        aria-live="polite"
        as="p"
        className="planner-pagination-summary"
        tone="muted"
      >
        Showing {rangeStart}-{rangeEnd} of {totalItems}
      </RadixText>
      <div className="planner-pagination-controls">
        <PlannerPaginationControl
          disabled={!canGoBack}
          href={canGoBack ? hrefForPage?.(safePage - 1) : undefined}
          icon="arrowLeft"
          label="Previous page"
          onClick={canGoBack && onPageChange ? () => onPageChange(safePage - 1) : undefined}
        />
        <RadixText as="span" className="planner-pagination-page" tone="default">
          Page {safePage} of {pageCount}
        </RadixText>
        <PlannerPaginationControl
          disabled={!canGoForward}
          href={canGoForward ? hrefForPage?.(safePage + 1) : undefined}
          icon="arrowRight"
          label="Next page"
          onClick={canGoForward && onPageChange ? () => onPageChange(safePage + 1) : undefined}
        />
      </div>
    </nav>
  );
}

function PlannerPaginationControl({
  disabled,
  href,
  icon,
  label,
  onClick
}: {
  readonly disabled: boolean;
  readonly href?: string;
  readonly icon: "arrowLeft" | "arrowRight";
  readonly label: string;
  readonly onClick?: () => void;
}) {
  if (href && !disabled) {
    return (
      <RadixIconButton
        asChild
        className="planner-pagination-button"
        label={label}
        tone="neutral"
        variant="soft"
      >
        <a href={href}>
          <RadixIcon decorative name={icon} />
        </a>
      </RadixIconButton>
    );
  }

  return (
    <RadixIconButton
      className="planner-pagination-button"
      disabled={disabled}
      label={label}
      onClick={onClick}
      tone="neutral"
      variant="soft"
    >
      <RadixIcon decorative name={icon} />
    </RadixIconButton>
  );
}
