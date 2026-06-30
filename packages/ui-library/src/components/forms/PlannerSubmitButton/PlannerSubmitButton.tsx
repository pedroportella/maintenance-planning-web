"use client";

import { useFormStatus } from "react-dom";
import { joinClasses } from "../../../utils";
import {
  RadixButton,
  type RadixButtonProps,
  RadixSpinner
} from "../../radix";

export type PlannerSubmitButtonProps = Omit<RadixButtonProps, "children" | "type"> & {
  children: RadixButtonProps["children"];
  pending?: boolean;
  pendingChildren?: RadixButtonProps["children"];
};

export function PlannerSubmitButton({
  children,
  className,
  disabled,
  pending,
  pendingChildren = "Submitting...",
  ...buttonProps
}: PlannerSubmitButtonProps) {
  const formStatus = useFormStatus();
  const isPending = pending ?? formStatus.pending;

  return (
    <RadixButton
      aria-busy={isPending ? true : undefined}
      className={joinClasses("planner-submit-button", className)}
      data-pending={isPending ? "true" : undefined}
      disabled={disabled || isPending}
      type="submit"
      {...buttonProps}
    >
      {isPending ? (
        <RadixSpinner
          aria-hidden="true"
          className="planner-submit-button-spinner"
          size="1"
        />
      ) : null}
      <span className="planner-submit-button-label">
        {isPending ? pendingChildren : children}
      </span>
    </RadixButton>
  );
}
