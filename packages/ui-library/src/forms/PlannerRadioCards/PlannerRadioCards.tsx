import type { ReactNode } from "react";
import {
  RadixRadioCards,
  type RadixRadioCardOption,
  type RadixRadioCardsProps
} from "../../radix";
import { PlannerFormField } from "../PlannerFormField";

export type PlannerRadioCardsProps = Omit<
  RadixRadioCardsProps,
  | "aria-describedby"
  | "aria-invalid"
  | "aria-required"
  | "className"
  | "id"
  | "options"
  | "required"
> & {
  className?: string;
  controlClassName?: string;
  error?: ReactNode;
  hint?: ReactNode;
  id?: string;
  label: ReactNode;
  optional?: boolean;
  options: readonly RadixRadioCardOption[];
  required?: boolean;
};

export function PlannerRadioCards({
  className,
  controlClassName,
  error,
  hint,
  id,
  label,
  name,
  optional,
  required,
  ...cardsProps
}: PlannerRadioCardsProps) {
  return (
    <PlannerFormField
      className={className}
      error={error}
      fieldType="group"
      hint={hint}
      id={id ?? name}
      label={label}
      optional={optional}
      required={required}
    >
      {(controlProps) => (
        <RadixRadioCards
          {...cardsProps}
          {...controlProps}
          className={controlClassName}
          name={name}
          required={required}
        />
      )}
    </PlannerFormField>
  );
}
