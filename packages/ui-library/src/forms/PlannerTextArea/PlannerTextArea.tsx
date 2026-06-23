import type { ReactNode } from "react";
import { RadixTextArea, type RadixTextAreaProps } from "../../radix";
import { PlannerFormField } from "../PlannerFormField";

export type PlannerTextAreaProps = Omit<
  RadixTextAreaProps,
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

export function PlannerTextArea({
  className,
  controlClassName,
  error,
  hint,
  id,
  label,
  name,
  optional,
  required,
  ...textAreaProps
}: PlannerTextAreaProps) {
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
        <RadixTextArea
          {...textAreaProps}
          {...controlProps}
          className={controlClassName}
          name={name}
          required={required}
        />
      )}
    </PlannerFormField>
  );
}
