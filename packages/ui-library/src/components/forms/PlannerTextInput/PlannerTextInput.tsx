import type { ReactNode } from "react";
import { RadixTextInput, type RadixTextInputProps } from "../../radix";
import { PlannerFormField } from "../PlannerFormField";

export type PlannerTextInputProps = Omit<
  RadixTextInputProps,
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

export function PlannerTextInput({
  className,
  controlClassName,
  error,
  hint,
  id,
  label,
  name,
  optional,
  required,
  ...inputProps
}: PlannerTextInputProps) {
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
        <RadixTextInput
          {...inputProps}
          {...controlProps}
          className={controlClassName}
          name={name}
          required={required}
        />
      )}
    </PlannerFormField>
  );
}
