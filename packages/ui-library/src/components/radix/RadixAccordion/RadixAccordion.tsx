import * as AccordionPrimitive from "@radix-ui/react-accordion";
import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";
import { RadixIcon } from "../RadixIcon";

export type RadixAccordionItem = {
  badge?: ReactNode;
  content: ReactNode;
  contentClassName?: string;
  disabled?: boolean;
  summary?: ReactNode;
  trigger: ReactNode;
  triggerClassName?: string;
  value: string;
};

type RadixAccordionBaseProps = {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  className?: string;
  itemClassName?: string;
  items: readonly RadixAccordionItem[];
};

type RadixAccordionSingleProps = RadixAccordionBaseProps & {
  collapsible?: boolean;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  type?: "single";
  value?: string;
};

type RadixAccordionMultipleProps = RadixAccordionBaseProps & {
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  type: "multiple";
  value?: string[];
};

export type RadixAccordionProps =
  | RadixAccordionSingleProps
  | RadixAccordionMultipleProps;

export function RadixAccordion(props: RadixAccordionProps) {
  const {
    ariaLabel,
    ariaLabelledBy,
    className,
    itemClassName,
    items
  } = props;
  const children = renderAccordionItems(items, itemClassName);

  if (props.type === "multiple") {
    return (
      <AccordionPrimitive.Root
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={joinClasses("radix-accordion", className)}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        type="multiple"
        value={props.value}
      >
        {children}
      </AccordionPrimitive.Root>
    );
  }

  return (
    <AccordionPrimitive.Root
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={joinClasses("radix-accordion", className)}
      collapsible={props.collapsible ?? true}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      type="single"
      value={props.value}
    >
      {children}
    </AccordionPrimitive.Root>
  );
}

function renderAccordionItems(
  items: readonly RadixAccordionItem[],
  itemClassName?: string
) {
  return items.map((item) => (
    <AccordionPrimitive.Item
      className={joinClasses("radix-accordion-item", itemClassName)}
      disabled={item.disabled}
      key={item.value}
      value={item.value}
    >
      <AccordionPrimitive.Header className="radix-accordion-header">
        <AccordionPrimitive.Trigger
          className={joinClasses("radix-accordion-trigger", item.triggerClassName)}
        >
          <span className="radix-accordion-trigger-copy">
            <span className="radix-accordion-trigger-label">{item.trigger}</span>
            {item.summary ? (
              <span className="radix-accordion-trigger-summary">
                {item.summary}
              </span>
            ) : null}
          </span>
          {item.badge ? (
            <span className="radix-accordion-trigger-badge">{item.badge}</span>
          ) : null}
          <RadixIcon
            className="radix-accordion-trigger-icon"
            decorative
            name="chevronDown"
          />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        className={joinClasses("radix-accordion-content", item.contentClassName)}
      >
        <div className="radix-accordion-content-inner">{item.content}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  ));
}
