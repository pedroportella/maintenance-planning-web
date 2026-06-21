import type { ComponentType, ReactNode } from "react";
import { joinClasses } from "../shared";

export type AppShellLinkProps = {
  "aria-current"?: "page";
  "aria-label"?: string;
  children: ReactNode;
  className?: string;
  href: string;
};

export type AppShellBrand = {
  ariaLabel: string;
  href: string;
  icon?: ReactNode;
  name: string;
  tagline?: string;
};

export type AppShellNavItem = {
  description?: string;
  group?: string;
  href: string;
  icon?: ReactNode;
  label: string;
};

export type AppShellProps = {
  activeHref?: string;
  brand: AppShellBrand;
  children: ReactNode;
  className?: string;
  linkComponent?: ComponentType<AppShellLinkProps>;
  navAriaLabel: string;
  navItems: readonly AppShellNavItem[];
  sidebarNote?: ReactNode;
};

export function AppShell({
  activeHref,
  brand,
  children,
  className,
  linkComponent,
  navAriaLabel,
  navItems,
  sidebarNote
}: AppShellProps) {
  const LinkComponent = linkComponent ?? DefaultShellLink;
  const navGroups = groupNavItems(navItems);

  return (
    <div className={joinClasses("app-shell", className)}>
      <aside className="app-shell-sidebar">
        <LinkComponent aria-label={brand.ariaLabel} className="app-shell-brand" href={brand.href}>
          {brand.icon ? <span className="app-shell-brand-mark">{brand.icon}</span> : null}
          <span className="app-shell-brand-copy">
            <strong>{brand.name}</strong>
            {brand.tagline ? <span>{brand.tagline}</span> : null}
          </span>
        </LinkComponent>

        <nav aria-label={navAriaLabel} className="app-shell-nav">
          {navGroups.map((group) => (
            <div className="app-shell-nav-group" key={group.label ?? "primary"}>
              {group.label ? <p className="app-shell-nav-heading">{group.label}</p> : null}
              {group.items.map((item) => {
                const isActive =
                  activeHref === item.href ||
                  Boolean(activeHref?.startsWith(`${item.href}/`));

                return (
                  <LinkComponent
                    aria-current={isActive ? "page" : undefined}
                    className={joinClasses(
                      "app-shell-nav-link",
                      isActive && "app-shell-nav-link-active"
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {item.icon ? <span className="app-shell-nav-icon">{item.icon}</span> : null}
                    <span className="app-shell-nav-copy">
                      <strong>{item.label}</strong>
                      {item.description ? <span>{item.description}</span> : null}
                    </span>
                  </LinkComponent>
                );
              })}
            </div>
          ))}
        </nav>

        {sidebarNote ? <div className="app-shell-note">{sidebarNote}</div> : null}
      </aside>

      <div className="app-shell-main">{children}</div>
    </div>
  );
}

function DefaultShellLink({ children, href, ...linkProps }: AppShellLinkProps) {
  return (
    <a href={href} {...linkProps}>
      {children}
    </a>
  );
}

function groupNavItems(navItems: readonly AppShellNavItem[]) {
  return navItems.reduce<Array<{ label?: string; items: AppShellNavItem[] }>>((groups, item) => {
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
