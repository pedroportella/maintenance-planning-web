"use client";

import { workbenchSections } from "@maintenance-planning/utils";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  FlaskConical,
  Lightbulb,
  Route
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const sectionIcons = {
  "work-order-backlog": ClipboardList,
  "planning-runs": CalendarClock,
  recommendations: Lightbulb,
  "coordination-exceptions": AlertTriangle,
  "operations-posture": Activity,
  "scenario-outcomes": FlaskConical
} as const;

export function WorkbenchShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="workbench-shell">
      <aside className="sidebar">
        <Link aria-label="Planner workbench home" className="brand-lockup" href="/">
          <span className="brand-mark">
            <Route aria-hidden="true" size={22} />
          </span>
          <span>
            <strong>Planner Workbench</strong>
            <span>Synthetic planning review</span>
          </span>
        </Link>

        <nav aria-label="Planner sections" className="shell-nav">
          {workbenchSections.map((section) => {
            const Icon = sectionIcons[section.slug];
            const isActive = pathname === section.path;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "nav-link nav-link-active" : "nav-link"}
                href={section.path}
                key={section.slug}
              >
                <Icon aria-hidden="true" size={20} />
                <span>
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
