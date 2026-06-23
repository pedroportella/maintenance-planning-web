import type { ReactNode } from "react";
import { RadixCheckbox, type RadixCheckboxProps } from "../../radix";
import { PlannerFormField } from "../PlannerFormField";

export type PlannerCheckboxProps = Omit<
  RadixCheckboxProps,
  "aria-describedby" | "aria-invalid" | "aria-required" | "className" | "id" | "required"
> & {
  className?: string;
  controlClassName?: string;
  error?: ReactNode;
  hint?: ReactNode;
  id?: string;
  label: ReactNode;
  optional?: boolean;
  required?: boolean;
};

export function PlannerCheckbox({
  className,
  controlClassName,
  error,
  hint,
  id,
  label,
  name,
  optional,
  required,
  ...checkboxProps
}: PlannerCheckboxProps) {
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
        <RadixCheckbox
          {...checkboxProps}
          {...controlProps}
          className={controlClassName}
          name={name}
          required={required}
        />
      )}
    </PlannerFormField>
  );
}
