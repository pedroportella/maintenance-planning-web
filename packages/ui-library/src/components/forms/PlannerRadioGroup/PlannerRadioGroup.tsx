import type { ReactNode } from "react";
import {
  RadixRadioGroup,
  type RadixRadioGroupOption,
  type RadixRadioGroupProps
} from "../../radix";
import { PlannerFormField } from "../PlannerFormField";

export type PlannerRadioGroupProps = Omit<
  RadixRadioGroupProps,
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
  options: readonly RadixRadioGroupOption[];
  required?: boolean;
};

export function PlannerRadioGroup({
  className,
  controlClassName,
  error,
  hint,
  id,
  label,
  name,
  optional,
  required,
  ...groupProps
}: PlannerRadioGroupProps) {
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
        <RadixRadioGroup
          {...groupProps}
          {...controlProps}
          className={controlClassName}
          name={name}
          required={required}
        />
      )}
    </PlannerFormField>
  );
}
