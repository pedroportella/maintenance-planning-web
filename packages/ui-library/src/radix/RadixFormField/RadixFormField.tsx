import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";

export type RadixFormFieldControlProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  id: string;
};

export type RadixFormFieldProps = {
  children: ReactNode | ((controlProps: RadixFormFieldControlProps) => ReactNode);
  className?: string;
  error?: ReactNode;
  fieldId: string;
  hint?: ReactNode;
  label: ReactNode;
  optionalLabel?: ReactNode;
};

export function RadixFormField({
  children,
  className,
  error,
  fieldId,
  hint,
  label,
  optionalLabel
}: RadixFormFieldProps) {
  const hasError = error !== undefined && error !== null && error !== false;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = hasError ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const controlProps: RadixFormFieldControlProps = {
    "aria-describedby": describedBy,
    "aria-invalid": hasError ? true : undefined,
    id: fieldId
  };

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
        {optionalLabel ? <span className="radix-form-field-optional">{optionalLabel}</span> : null}
      </label>
      {hint ? (
        <p className="radix-form-field-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      <div className="radix-form-field-control">
        {typeof children === "function" ? children(controlProps) : children}
      </div>
      {hasError ? (
        <p className="radix-form-field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
