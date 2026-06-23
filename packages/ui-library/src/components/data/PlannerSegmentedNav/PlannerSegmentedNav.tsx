import type { ComponentType, ReactNode } from "react";
import { joinClasses } from "../../../utils";

export type PlannerSegmentedNavLinkProps = {
  "aria-current"?: "page";
  children: ReactNode;
  className?: string;
  href: string;
};

export type PlannerSegmentedNavOption = {
  href: string;
  label: string;
  selected?: boolean;
};

export type PlannerSegmentedNavProps = {
  ariaLabel: string;
  className?: string;
  linkComponent?: ComponentType<PlannerSegmentedNavLinkProps>;
  options: readonly PlannerSegmentedNavOption[];
};

export function PlannerSegmentedNav({
  ariaLabel,
  className,
  linkComponent,
  options
}: PlannerSegmentedNavProps) {
  const LinkComponent = linkComponent ?? DefaultPlannerSegmentedNavLink;

  return (
    <nav aria-label={ariaLabel} className={joinClasses("planner-segmented-nav", className)}>
      <ul>
        {options.map((option) => (
          <li key={option.href}>
            <LinkComponent
              aria-current={option.selected ? "page" : undefined}
              className={joinClasses(
                "planner-segmented-nav-link",
                option.selected && "planner-segmented-nav-link-active"
              )}
              href={option.href}
            >
              {option.label}
            </LinkComponent>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function DefaultPlannerSegmentedNavLink({
  children,
  href,
  ...linkProps
}: PlannerSegmentedNavLinkProps) {
  return (
    <a href={href} {...linkProps}>
      {children}
    </a>
  );
}
