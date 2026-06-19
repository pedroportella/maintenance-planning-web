import type { ComponentType, ReactNode } from "react";
import { joinClasses } from "../shared";

export type SegmentedNavLinkProps = {
  "aria-current"?: "page";
  children: ReactNode;
  className?: string;
  href: string;
};

export type SegmentedNavOption = {
  href: string;
  label: string;
  selected?: boolean;
};

export type SegmentedNavProps = {
  ariaLabel: string;
  className?: string;
  linkComponent?: ComponentType<SegmentedNavLinkProps>;
  options: readonly SegmentedNavOption[];
};

export function SegmentedNav({
  ariaLabel,
  className,
  linkComponent,
  options
}: SegmentedNavProps) {
  const LinkComponent = linkComponent ?? DefaultSegmentedLink;

  return (
    <nav aria-label={ariaLabel} className={joinClasses("segmented-nav", className)}>
      <ul>
        {options.map((option) => (
          <li key={option.href}>
            <LinkComponent
              aria-current={option.selected ? "page" : undefined}
              className={joinClasses("segmented-nav-link", option.selected && "segmented-nav-link-active")}
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

function DefaultSegmentedLink({ children, href, ...linkProps }: SegmentedNavLinkProps) {
  return (
    <a href={href} {...linkProps}>
      {children}
    </a>
  );
}
