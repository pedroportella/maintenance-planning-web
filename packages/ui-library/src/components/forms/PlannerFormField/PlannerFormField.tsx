import { useId, type ReactNode } from "react";
import {
  RadixFormField,
  type RadixFormFieldControlProps
} from "../../radix";

export type PlannerFormFieldProps = {
  children: ReactNode | ((controlProps: RadixFormFieldControlProps) => ReactNode);
  className?: string;
  error?: ReactNode;
  fieldType?: "control" | "group";
  hint?: ReactNode;
  id?: string;
  label: ReactNode;
  optional?: boolean;
  optionalLabel?: ReactNode;
  required?: boolean;
  requiredLabel?: ReactNode;
};

export function PlannerFormField({
  children,
  className,
  error,
  fieldType,
  hint,
  id,
  label,
  optional = false,
  optionalLabel = "Optional",
  required = false,
  requiredLabel = "Required"
}: PlannerFormFieldProps) {
  const generatedId = useId().replace(/:/g, "");
  const fieldId = id ?? `planner-field-${generatedId}`;

  return (
    <RadixFormField
      className={className}
      error={error}
      fieldId={fieldId}
      fieldType={fieldType}
      hint={hint}
      label={label}
      optionalLabel={optional && !required ? optionalLabel : undefined}
      required={required}
      requiredLabel={required ? requiredLabel : undefined}
    >
      {children}
    </RadixFormField>
  );
}
