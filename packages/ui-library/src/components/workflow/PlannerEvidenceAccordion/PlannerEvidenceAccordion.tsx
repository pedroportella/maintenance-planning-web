import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";
import { RadixAccordion } from "../../radix";

export type PlannerEvidenceAccordionItem = {
  badge?: ReactNode;
  children: ReactNode;
  summary?: ReactNode;
  title: ReactNode;
  value: string;
};

type PlannerEvidenceAccordionBaseProps = {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  className?: string;
  itemClassName?: string;
  items: readonly PlannerEvidenceAccordionItem[];
};

type PlannerEvidenceAccordionSingleProps = PlannerEvidenceAccordionBaseProps & {
  collapsible?: boolean;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  type?: "single";
  value?: string;
};

type PlannerEvidenceAccordionMultipleProps = PlannerEvidenceAccordionBaseProps & {
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  type: "multiple";
  value?: string[];
};

export type PlannerEvidenceAccordionProps =
  | PlannerEvidenceAccordionSingleProps
  | PlannerEvidenceAccordionMultipleProps;

export function PlannerEvidenceAccordion(props: PlannerEvidenceAccordionProps) {
  const {
    className,
    itemClassName,
    items
  } = props;
  const mappedItems = items.map((item) => ({
    badge: item.badge,
    content: (
      <div className="planner-evidence-accordion-body">{item.children}</div>
    ),
    summary: item.summary ? (
      <span className="planner-evidence-accordion-summary">{item.summary}</span>
    ) : undefined,
    trigger: (
      <span className="planner-evidence-accordion-title">{item.title}</span>
    ),
    value: item.value
  }));
  const resolvedClassName = joinClasses("planner-evidence-accordion", className);

  if (props.type === "multiple") {
    return (
      <RadixAccordion
        ariaLabel={props.ariaLabel}
        ariaLabelledBy={props.ariaLabelledBy}
        className={resolvedClassName}
        defaultValue={props.defaultValue}
        itemClassName={itemClassName}
        items={mappedItems}
        onValueChange={props.onValueChange}
        type="multiple"
        value={props.value}
      />
    );
  }

  return (
    <RadixAccordion
      ariaLabel={props.ariaLabel}
      ariaLabelledBy={props.ariaLabelledBy}
      className={resolvedClassName}
      collapsible={props.collapsible}
      defaultValue={props.defaultValue}
      itemClassName={itemClassName}
      items={mappedItems}
      onValueChange={props.onValueChange}
      type="single"
      value={props.value}
    />
  );
}
