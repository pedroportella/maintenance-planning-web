"use client";

import type { ComponentType, KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { joinClasses } from "../../../utils";
import { RadixIcon } from "../../radix/RadixIcon";
import {
  PlannerSideNav,
  type PlannerSideNavItem,
  type PlannerSideNavLinkProps
} from "../PlannerSideNav";

export type PlannerAppLayoutBrand = {
  ariaLabel: string;
  href: string;
  icon?: ReactNode;
  name: string;
  tagline?: string;
};

export type PlannerAppLayoutProps = {
  activeHref?: string;
  brand: PlannerAppLayoutBrand;
  children: ReactNode;
  className?: string;
  contentId?: string;
  focusMode?: boolean;
  headerActions?: ReactNode;
  linkComponent?: ComponentType<PlannerSideNavLinkProps>;
  navAriaLabel: string;
  navItems: readonly PlannerSideNavItem[];
  sidebarNote?: ReactNode;
  skipLinkLabel?: string;
};

export type PlannerAppLayoutLinkProps = PlannerSideNavLinkProps;
export type PlannerAppLayoutNavItem = PlannerSideNavItem;

const defaultContentId = "planner-main";

export function PlannerAppLayout({
  activeHref,
  brand,
  children,
  className,
  contentId = defaultContentId,
  focusMode = false,
  headerActions,
  linkComponent,
  navAriaLabel,
  navItems,
  sidebarNote,
  skipLinkLabel = "Skip to main content"
}: PlannerAppLayoutProps) {
  const drawerId = `${useId()}-planner-navigation`;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const LinkComponent = linkComponent ?? DefaultLayoutLink;
  const brandAccessibleName = [brand.name, brand.tagline, brand.ariaLabel]
    .filter(Boolean)
    .join(" - ");

  function closeDrawer(restoreFocus = true) {
    setIsDrawerOpen(false);

    if (restoreFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  }

  function handleDrawerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableElements(drawerRef.current);

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  useEffect(() => {
    if (!isDrawerOpen) {
      return undefined;
    }

    document.body.classList.add("planner-app-layout-drawer-open");
    getFocusableElements(drawerRef.current)[0]?.focus();

    return () => {
      document.body.classList.remove("planner-app-layout-drawer-open");
    };
  }, [isDrawerOpen]);

  const navigation = (
    <PlannerSideNav
      activeHref={activeHref}
      ariaLabel={navAriaLabel}
      items={navItems}
      linkComponent={linkComponent}
    />
  );

  return (
    <div
      className={joinClasses(
        "planner-app-layout",
        focusMode && "planner-app-layout-focus-mode",
        className
      )}
      data-focus-mode={focusMode ? "true" : undefined}
    >
      <a className="planner-app-layout-skip-link" href={`#${contentId}`}>
        {skipLinkLabel}
      </a>

      <header className="planner-app-layout-header">
        <LinkComponent
          aria-label={brandAccessibleName}
          className="planner-app-layout-brand"
          href={brand.href}
        >
          {brand.icon ? <span className="planner-app-layout-brand-mark">{brand.icon}</span> : null}
          <span className="planner-app-layout-brand-copy">
            <strong>{brand.name}</strong>
            {brand.tagline ? <span>{brand.tagline}</span> : null}
          </span>
        </LinkComponent>

        <div className="planner-app-layout-header-actions">
          {headerActions}
          {!focusMode ? (
            <button
              aria-controls={drawerId}
              aria-expanded={isDrawerOpen}
              className="planner-app-layout-menu-button"
              onClick={() => setIsDrawerOpen(true)}
              ref={menuButtonRef}
              type="button"
            >
              <RadixIcon decorative name="reader" />
              <span>Menu</span>
            </button>
          ) : null}
        </div>
      </header>

      <div className="planner-app-layout-body">
        {!focusMode ? (
          <aside className="planner-app-layout-sidebar">
            {navigation}
            {sidebarNote ? <div className="planner-app-layout-note">{sidebarNote}</div> : null}
          </aside>
        ) : null}

        <div className="planner-app-layout-content" id={contentId} tabIndex={-1}>
          {children}
        </div>
      </div>

      {!focusMode ? (
        <div className="planner-app-layout-drawer-shell" hidden={!isDrawerOpen}>
          <button
            aria-label="Close navigation"
            className="planner-app-layout-drawer-backdrop"
            onClick={() => closeDrawer()}
            type="button"
          />
          <div
            aria-label={navAriaLabel}
            aria-modal="true"
            className="planner-app-layout-drawer"
            id={drawerId}
            onKeyDown={handleDrawerKeyDown}
            ref={drawerRef}
            role="dialog"
          >
            <div className="planner-app-layout-drawer-header">
              <span className="planner-app-layout-drawer-title">Navigation</span>
              <button
                className="planner-app-layout-drawer-close"
                onClick={() => closeDrawer()}
                type="button"
              >
                Close
              </button>
            </div>
            <PlannerSideNav
              activeHref={activeHref}
              ariaLabel={navAriaLabel}
              items={navItems}
              linkComponent={linkComponent}
              onNavigate={() => closeDrawer(false)}
            />
            {sidebarNote ? <div className="planner-app-layout-note">{sidebarNote}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DefaultLayoutLink({ children, href, ...linkProps }: PlannerSideNavLinkProps) {
  return (
    <a href={href} {...linkProps}>
      {children}
    </a>
  );
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        "a[href]",
        "button:not([disabled])",
        "textarea:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        '[tabindex]:not([tabindex="-1"])'
      ].join(",")
    )
  ).filter((element) => element.offsetParent !== null || element === document.activeElement);
}
