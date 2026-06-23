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
