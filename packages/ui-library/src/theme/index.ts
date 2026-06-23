export type { PlannerThemeProviderProps } from "./PlannerThemeProvider";
export { PlannerThemeProvider } from "./PlannerThemeProvider";
export type {
  PlannerThemeAccentColor,
  PlannerThemeAppearance,
  PlannerThemeConfig,
  PlannerThemeGrayColor,
  PlannerNextThemesConfig,
  PlannerNextThemesProviderProps,
  PlannerRadixThemeConfig,
  PlannerThemePanelBackground,
  PlannerThemeRadius,
  PlannerThemeScaling
} from "./theme-config";
export {
  plannerNextThemesConfig,
  plannerRadixThemeConfig,
  plannerThemeConfig
} from "./theme-config";

export const workbenchTheme = {
  radixCssEntrypoint: "@radix-ui/themes/styles.css",
  sassEntrypoint: "@maintenance-planning/ui-library/theme.scss",
  tokenPaletteEntrypoints: [
    "@maintenance-planning/ui-tokens/scss/styles/maintenance-primitive-palette.scss",
    "@maintenance-planning/ui-tokens/scss/styles/planner-product-palette.scss"
  ]
} as const;

export const workbenchThemeClassNames = {
  alert: "planner-alert",
  appShell: "planner-app-layout",
  contentSection: "planner-content-section",
  dataTable: "data-table",
  decisionPanel: "planner-decision-panel",
  emptyState: "planner-empty-state",
  loadingState: "planner-loading-state",
  metadataPanel: "planner-metadata-panel",
  metricSummary: "planner-metric-summary",
  panel: "workbench-panel",
  pageHeader: "planner-page-header",
  pageShell: "planner-page",
  segmentedNav: "segmented-nav",
  sideNav: "planner-side-nav",
  summaryList: "planner-summary-list",
  statusBadge: "planner-status-badge"
} as const;
