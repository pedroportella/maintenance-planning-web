"use client";

import {
  getWorkbenchSectionIconName,
  workbenchBrand,
  workbenchIconNames
} from "@maintenance-planning/ui-assets";
import { workbenchSections } from "@maintenance-planning/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { getLucideIcon } from "@/components/lucide-icon";

export function WorkbenchShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const BrandIcon = getLucideIcon(workbenchIconNames.brand);

  return (
    <div className="workbench-shell">
      <aside className="sidebar">
        <Link aria-label={workbenchBrand.ariaLabel} className="brand-lockup" href="/">
          <span className="brand-mark">
            <BrandIcon aria-hidden="true" size={22} />
          </span>
          <span className="brand-lockup-text">
            <strong>{workbenchBrand.name}</strong>
            <span>{workbenchBrand.tagline}</span>
          </span>
        </Link>

        <nav aria-label="Planner sections" className="shell-nav">
          {workbenchSections.map((section) => {
            const Icon = getLucideIcon(getWorkbenchSectionIconName(section.slug));
            const isActive = pathname === section.path;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "nav-link nav-link-active" : "nav-link"}
                href={section.path}
                key={section.slug}
              >
                <Icon aria-hidden="true" size={20} />
                <span className="nav-link-copy">
                  <strong>{section.label}</strong>
                  <span>{section.navHint}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <p className="sidebar-note">
          Local review uses synthetic placeholders only. API-backed service wiring is intentionally
          outside this shell.
        </p>
      </aside>

      <div className="main-surface">{children}</div>
    </div>
  );
}
