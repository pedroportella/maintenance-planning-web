import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";
import {
  RadixButton,
  type RadixButtonProps,
  type RadixButtonVariant
} from "../../radix";

export type PlannerActionGroupProps = {
  align?: "end" | "start";
  children: ReactNode;
  className?: string;
};

export type PlannerActionLinkPriority = "primary" | "secondary";

export type PlannerActionLinkProps = Omit<
  RadixButtonProps,
  "children" | "tone" | "variant"
> & {
  children: ReactNode;
  priority?: PlannerActionLinkPriority;
};

const variantByPriority: Record<PlannerActionLinkPriority, RadixButtonVariant> = {
  primary: "solid",
  secondary: "surface"
};

export function PlannerActionGroup({
  align = "end",
  children,
  className
}: PlannerActionGroupProps) {
  return (
    <span
      className={joinClasses("planner-action-group", className)}
      data-align={align}
    >
      {children}
    </span>
  );
}

export function PlannerActionLink({
  children,
  className,
  priority = "primary",
  ...actionProps
}: PlannerActionLinkProps) {
  return (
    <RadixButton
      className={joinClasses("planner-action-link", className)}
      data-priority={priority}
      tone={priority === "primary" ? "accent" : "neutral"}
      variant={variantByPriority[priority]}
      {...actionProps}
    >
      {children}
    </RadixButton>
  );
}
