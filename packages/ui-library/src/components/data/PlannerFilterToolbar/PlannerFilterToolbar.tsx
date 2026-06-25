import { useId, type ChangeEvent, type ComponentType, type ReactNode } from "react";
import {
  PlannerSegmentedNav,
  type PlannerSegmentedNavLinkProps,
  type PlannerSegmentedNavOption
} from "../PlannerSegmentedNav";
import { joinClasses } from "../../../utils";
import {
  RadixButton,
  RadixIcon,
  RadixSelect,
  type RadixSelectOption,
  RadixTextInput
} from "../../radix";

export type PlannerFilterToolbarSearch = {
  clearLabel?: string;
  disabled?: boolean;
  id: string;
  label: string;
  name?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
};

export type PlannerFilterToolbarLinkFilter = {
  ariaLabel: string;
  kind: "links";
  linkComponent?: ComponentType<PlannerSegmentedNavLinkProps>;
  options: readonly PlannerSegmentedNavOption[];
};

export type PlannerFilterToolbarSelectFilter = {
  id: string;
  kind: "select";
  label: string;
  onValueChange?: (value: string) => void;
  options: readonly RadixSelectOption[];
  placeholder?: string;
  value?: string;
};

export type PlannerFilterToolbarFilter =
  | PlannerFilterToolbarLinkFilter
  | PlannerFilterToolbarSelectFilter;

export type PlannerFilterToolbarProps = {
  actions?: ReactNode;
  ariaLabel: string;
  className?: string;
  clearAction?: {
    disabled?: boolean;
    label: string;
    onClear?: () => void;
  };
  filters?: readonly PlannerFilterToolbarFilter[];
  resultSummary?: ReactNode;
  search?: PlannerFilterToolbarSearch;
};

export function PlannerFilterToolbar({
  actions,
  ariaLabel,
  className,
  clearAction,
  filters = [],
  resultSummary,
  search
}: PlannerFilterToolbarProps) {
  const generatedId = useId().replace(/:/g, "");
  const resultSummaryId = resultSummary
    ? `planner-filter-toolbar-${generatedId}-result`
    : undefined;

  return (
    <section
      aria-label={ariaLabel}
      aria-describedby={resultSummaryId}
      className={joinClasses("planner-filter-toolbar", className)}
    >
      {filters.length > 0 ? (
        <div className="planner-filter-toolbar-filters">
          {filters.map((filter) => (
            <PlannerFilterToolbarFilterControl filter={filter} key={filterKey(filter)} />
          ))}
        </div>
      ) : null}

      <div className="planner-filter-toolbar-controls">
        {search ? (
          <PlannerFilterToolbarSearchControl
            resultSummaryId={resultSummaryId}
            search={search}
          />
        ) : null}

        <div className="planner-filter-toolbar-summary">
          {resultSummary ? (
            <p
              aria-atomic="true"
              aria-live="polite"
              className="planner-filter-toolbar-result"
              id={resultSummaryId}
              role="status"
            >
              {resultSummary}
            </p>
          ) : null}
          {clearAction ? (
            <RadixButton
              aria-describedby={resultSummaryId}
              className="planner-filter-toolbar-clear"
              disabled={clearAction.disabled}
              onClick={clearAction.onClear}
              tone="neutral"
              variant="soft"
            >
              <RadixIcon decorative name="crossCircled" />
              {clearAction.label}
            </RadixButton>
          ) : null}
          {actions}
        </div>
      </div>
    </section>
  );
}

function PlannerFilterToolbarSearchControl({
  resultSummaryId,
  search
}: {
  readonly resultSummaryId?: string;
  readonly search: PlannerFilterToolbarSearch;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    search.onChange?.(event.currentTarget.value);
  };

  return (
    <div className="planner-filter-toolbar-search">
      <label className="planner-filter-toolbar-label" htmlFor={search.id}>
        {search.label}
      </label>
      <div className="planner-filter-toolbar-search-field">
        <RadixIcon className="planner-filter-toolbar-search-icon" decorative name="magnifyingGlass" />
        <RadixTextInput
          aria-label={search.label}
          aria-describedby={resultSummaryId}
          disabled={search.disabled}
          id={search.id}
          name={search.name}
          onChange={search.onChange ? handleChange : undefined}
          placeholder={search.placeholder}
          readOnly={search.readOnly ?? !search.onChange}
          value={search.value}
        />
        {search.onClear ? (
          <RadixButton
            className="planner-filter-toolbar-search-clear"
            disabled={search.disabled || search.value.length === 0}
            onClick={search.onClear}
            tone="neutral"
            variant="ghost"
          >
            <RadixIcon decorative name="crossCircled" />
            {search.clearLabel ?? "Clear"}
          </RadixButton>
        ) : null}
      </div>
    </div>
  );
}

function PlannerFilterToolbarFilterControl({
  filter
}: {
  readonly filter: PlannerFilterToolbarFilter;
}) {
  if (filter.kind === "links") {
    return (
      <PlannerSegmentedNav
        ariaLabel={filter.ariaLabel}
        className="planner-filter-toolbar-links"
        linkComponent={filter.linkComponent}
        options={filter.options}
      />
    );
  }

  return (
    <div className="planner-filter-toolbar-select">
      <label className="planner-filter-toolbar-label" htmlFor={filter.id}>
        {filter.label}
      </label>
      <RadixSelect
        id={filter.id}
        onValueChange={filter.onValueChange}
        options={filter.options}
        placeholder={filter.placeholder}
        value={filter.value}
      />
    </div>
  );
}

function filterKey(filter: PlannerFilterToolbarFilter): string {
  return filter.kind === "links" ? `${filter.kind}:${filter.ariaLabel}` : `${filter.kind}:${filter.id}`;
}
