import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";

export type RadixFormFieldControlProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
  id: string;
};

export type RadixFormFieldProps = {
  children: ReactNode | ((controlProps: RadixFormFieldControlProps) => ReactNode);
  className?: string;
  error?: ReactNode;
  fieldId: string;
  fieldType?: "control" | "group";
  hint?: ReactNode;
  label: ReactNode;
  optionalLabel?: ReactNode;
  required?: boolean;
  requiredLabel?: ReactNode;
};

export function RadixFormField({
  children,
  className,
  error,
  fieldId,
  fieldType = "control",
  hint,
  label,
  optionalLabel,
  required = false,
  requiredLabel
}: RadixFormFieldProps) {
  const hasError = error !== undefined && error !== null && error !== false;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = hasError ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const requirementLabel = required ? requiredLabel : optionalLabel;
  const controlProps: RadixFormFieldControlProps = {
    "aria-describedby": describedBy,
    "aria-invalid": hasError ? true : undefined,
    "aria-required": required ? true : undefined,
    id: fieldId
  };
  const renderedChildren = typeof children === "function" ? children(controlProps) : children;

  if (fieldType === "group") {
    return (
      <fieldset
        aria-describedby={describedBy}
        className={joinClasses(
          "radix-form-field",
          "radix-form-field-group",
          hasError && "radix-form-field-invalid",
          className
        )}
        data-invalid={hasError ? true : undefined}
        data-required={required ? true : undefined}
      >
        <legend className="radix-form-field-label">
          <span>{label}</span>
          {requirementLabel ? (
            <span className="radix-form-field-requirement">{requirementLabel}</span>
          ) : null}
        </legend>
        {hint ? (
          <p className="radix-form-field-hint" id={hintId}>
            {hint}
          </p>
        ) : null}
        <div className="radix-form-field-control">{renderedChildren}</div>
        {hasError ? (
          <p className="radix-form-field-error" id={errorId} role="alert">
            {error}
          </p>
        ) : null}
      </fieldset>
    );
  }

  return (
    <div
      className={joinClasses(
        "radix-form-field",
        hasError && "radix-form-field-invalid",
        className
      )}
      data-invalid={hasError ? true : undefined}
    >
      <label className="radix-form-field-label" htmlFor={fieldId}>
        <span>{label}</span>
        {requirementLabel ? (
          <span className="radix-form-field-requirement">{requirementLabel}</span>
        ) : null}
      </label>
      {hint ? (
        <p className="radix-form-field-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      <div className="radix-form-field-control">{renderedChildren}</div>
      {hasError ? (
        <p className="radix-form-field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
