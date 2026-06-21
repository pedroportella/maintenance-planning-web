"use client";

import {
  getWorkbenchSectionIconName,
  workbenchBrand,
  workbenchIconNames
} from "@maintenance-planning/ui-assets";
import { AppShell, type AppShellLinkProps, type AppShellNavItem } from "@maintenance-planning/ui-library";
import { workbenchSections } from "@maintenance-planning/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { getLucideIcon } from "@/components/lucide-icon";

export function PlannerAppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const BrandIcon = getLucideIcon(workbenchIconNames.brand);
  const navItems = workbenchSections.map<AppShellNavItem>((section) => {
    const Icon = getLucideIcon(getWorkbenchSectionIconName(section.slug));

    return {
      description: section.navHint,
      href: section.path,
      icon: <Icon aria-hidden="true" size={20} />,
      label: section.label
    };
  });

  return (
    <AppShell
      activeHref={pathname}
      brand={{
        ariaLabel: workbenchBrand.ariaLabel,
        href: "/",
        icon: <BrandIcon aria-hidden="true" size={22} />,
        name: workbenchBrand.name,
        tagline: workbenchBrand.tagline
      }}
      linkComponent={ShellLink}
      navAriaLabel="Planner sections"
      navItems={navItems}
      sidebarNote="Local review uses synthetic data through the server-side planner service boundary."
    >
      {children}
    </AppShell>
  );
}

function ShellLink({ children, href, ...linkProps }: AppShellLinkProps) {
  return (
    <Link href={href} {...linkProps}>
      {children}
    </Link>
  );
}
