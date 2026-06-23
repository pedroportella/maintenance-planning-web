import type { ComponentType, ReactNode } from "react";
import { joinClasses } from "../../components/shared";

export type PlannerSideNavItem = {
  badge?: ReactNode;
  description?: string;
  group?: string;
  href: string;
  icon?: ReactNode;
  label: string;
};

export type PlannerSideNavLinkProps = {
  "aria-current"?: "page";
  "aria-label"?: string;
  children: ReactNode;
  className?: string;
  href: string;
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
  const navGroups = groupNavItems(items);

  return (
    <nav aria-label={ariaLabel} className={joinClasses("planner-side-nav", className)}>
      {navGroups.map((group) => (
        <div className="planner-side-nav-group" key={group.label ?? "primary"}>
          {group.label ? <p className="planner-side-nav-heading">{group.label}</p> : null}
          <ul className="planner-side-nav-list">
            {group.items.map((item) => {
              const isActive = isActiveHref(activeHref, item.href);

              return (
                <li className="planner-side-nav-item" key={item.href}>
                  <LinkComponent
                    aria-current={isActive ? "page" : undefined}
                    className={joinClasses(
                      "planner-side-nav-link",
                      isActive && "planner-side-nav-link-active"
                    )}
                    href={item.href}
                    onClick={onNavigate}
                  >
                    {item.icon ? <span className="planner-side-nav-icon">{item.icon}</span> : null}
                    <span className="planner-side-nav-copy">
                      <strong>{item.label}</strong>
                      {item.description ? <span>{item.description}</span> : null}
                    </span>
                    {item.badge ? <span className="planner-side-nav-badge">{item.badge}</span> : null}
                  </LinkComponent>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
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

function groupNavItems(navItems: readonly PlannerSideNavItem[]) {
  return navItems.reduce<Array<{ label?: string; items: PlannerSideNavItem[] }>>((groups, item) => {
    const currentGroup = groups.at(-1);

    if (!currentGroup || currentGroup.label !== item.group) {
      groups.push({
        label: item.group,
        items: [item]
      });

      return groups;
    }

    currentGroup.items.push(item);
    return groups;
  }, []);
}

function isActiveHref(activeHref: string | undefined, itemHref: string) {
  if (!activeHref) {
    return false;
  }

  if (itemHref === "/") {
    return activeHref === "/";
  }

  return activeHref === itemHref || activeHref.startsWith(`${itemHref}/`);
}
