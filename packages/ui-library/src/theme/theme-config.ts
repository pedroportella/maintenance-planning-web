export type PlannerThemeAccentColor = "blue";
export type PlannerThemeAppearance = "dark" | "light" | "system";
export type PlannerThemeGrayColor = "gray";
export type PlannerThemePanelBackground = "solid" | "translucent";
export type PlannerThemeRadius = "large" | "medium" | "none" | "small";
export type PlannerThemeScaling = "100%";

export type PlannerThemeConfig = Readonly<{
  accentColor: PlannerThemeAccentColor;
  defaultAppearance: PlannerThemeAppearance;
  grayColor: PlannerThemeGrayColor;
  panelBackground: PlannerThemePanelBackground;
  radius: PlannerThemeRadius;
  scaling: PlannerThemeScaling;
}>;

export const plannerThemeConfig = {
  accentColor: "blue",
  defaultAppearance: "system",
  grayColor: "gray",
  panelBackground: "solid",
  radius: "medium",
  scaling: "100%"
} as const satisfies PlannerThemeConfig;
