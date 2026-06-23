export type {
  PlannerThemeAccentColor,
  PlannerThemeAppearance,
  PlannerThemeConfig,
  PlannerThemeGrayColor,
  PlannerThemePanelBackground,
  PlannerThemeRadius,
  PlannerThemeScaling
} from "./theme-config";
export { plannerThemeConfig } from "./theme-config";

export const workbenchTheme = {
  cssEntrypoint: "@maintenance-planning/ui-library/theme.css",
  sassEntrypoint: "@maintenance-planning/ui-library/theme.scss",
  tokenEntrypoint: "@maintenance-planning/ui-tokens/theme.css"
} as const;

export const workbenchThemeClassNames = {
  alert: "workbench-alert",
  appShell: "app-shell",
  dataTable: "data-table",
  emptyState: "empty-state",
  loadingState: "loading-state",
  metricSummary: "metric-summary",
  panel: "workbench-panel",
  pageHeader: "page-header",
  segmentedNav: "segmented-nav",
  statusBadge: "status-badge"
} as const;
