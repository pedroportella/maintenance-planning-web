import type { ComponentType, ReactNode } from "react";
import type { AppShellLinkProps, AppShellNavItem } from "../../components/app-shell/app-shell";
import { joinClasses } from "../../components/shared";

export type PlannerSideNavItem = AppShellNavItem & {
  badge?: ReactNode;
};

export type PlannerSideNavLinkProps = AppShellLinkProps & {
  onClick?: () => void;
};

export type PlannerSideNavProps = {
  activeHref?: string;
  ariaLabel: string;
  className?: string;
  items: readonly PlannerSideNavItem[];
  linkComponent?: ComponentType<PlannerSideNavLinkProps>;
  onNavigate?: () => void;
};

export function PlannerSideNav({
  activeHref,
  ariaLabel,
  className,
  items,
  linkComponent,
  onNavigate
}: PlannerSideNavProps) {
  const LinkComponent = linkComponent ?? DefaultSideNavLink;

  return (
    <nav aria-label={ariaLabel} className={joinClasses("planner-side-nav", className)}>
      {items.map((item) => {
        const isActive = activeHref === item.href || Boolean(activeHref?.startsWith(`${item.href}/`));

        return (
          <LinkComponent
            aria-current={isActive ? "page" : undefined}
            className={joinClasses(
              "planner-side-nav-link",
              isActive && "planner-side-nav-link-active"
            )}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
          >
            {item.icon ? <span className="planner-side-nav-icon">{item.icon}</span> : null}
            <span className="planner-side-nav-copy">
              <strong>{item.label}</strong>
              {item.description ? <span>{item.description}</span> : null}
            </span>
            {item.badge ? <span className="planner-side-nav-badge">{item.badge}</span> : null}
          </LinkComponent>
        );
      })}
    </nav>
  );
}

function DefaultSideNavLink({ children, href, ...linkProps }: PlannerSideNavLinkProps) {
  return (
    <a href={href} {...linkProps}>
      {children}
    </a>
  );
}
