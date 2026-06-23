import type { ReactNode } from "react";
import {
  RadixSelect,
  type RadixSelectOption,
  type RadixSelectProps
} from "../../radix";
import { PlannerFormField } from "../PlannerFormField";

export type PlannerSelectProps = Omit<
  RadixSelectProps,
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
  options: readonly RadixSelectOption[];
  required?: boolean;
};

export function PlannerSelect({
  className,
  controlClassName,
  error,
  hint,
  id,
  label,
  name,
  optional,
  required,
  ...selectProps
}: PlannerSelectProps) {
  return (
    <PlannerFormField
      className={className}
      error={error}
      hint={hint}
      id={id ?? name}
      label={label}
      optional={optional}
      required={required}
    >
      {(controlProps) => (
        <RadixSelect
          {...selectProps}
          {...controlProps}
          className={controlClassName}
          name={name}
          required={required}
        />
      )}
    </PlannerFormField>
  );
}
