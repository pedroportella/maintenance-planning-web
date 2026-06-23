import type { ThemeProps as RadixThemeProps } from "@radix-ui/themes";
import type { ThemeProviderProps as NextThemesProviderProps } from "next-themes";

export type PlannerThemeAccentColor = NonNullable<RadixThemeProps["accentColor"]>;
export type PlannerThemeAppearance = "dark" | "light" | "system";
export type PlannerThemeGrayColor = NonNullable<RadixThemeProps["grayColor"]>;
export type PlannerThemePanelBackground = NonNullable<RadixThemeProps["panelBackground"]>;
export type PlannerThemeRadius = NonNullable<RadixThemeProps["radius"]>;
export type PlannerThemeScaling = NonNullable<RadixThemeProps["scaling"]>;

export type PlannerRadixThemeConfig = Readonly<
  Required<
    Pick<
      RadixThemeProps,
      | "accentColor"
      | "appearance"
      | "grayColor"
      | "hasBackground"
      | "panelBackground"
      | "radius"
      | "scaling"
    >
  >
>;

export type PlannerNextThemesConfig = Readonly<{
  attribute: "class";
  defaultTheme: PlannerThemeAppearance;
  disableTransitionOnChange: boolean;
  enableColorScheme: boolean;
  enableSystem: boolean;
  storageKey: string;
  themes: readonly ["light", "dark"];
}>;

export type PlannerThemeConfig = Readonly<{
  nextThemes: PlannerNextThemesConfig;
  radixTheme: PlannerRadixThemeConfig;
  themeClassName: string;
}>;

export const plannerRadixThemeConfig = {
  accentColor: "teal",
  appearance: "inherit",
  grayColor: "sage",
  hasBackground: true,
  panelBackground: "solid",
  radius: "medium",
  scaling: "100%"
} as const satisfies PlannerRadixThemeConfig;

export const plannerNextThemesConfig = {
  attribute: "class",
  defaultTheme: "system",
  disableTransitionOnChange: true,
  enableColorScheme: true,
  enableSystem: true,
  storageKey: "planner-workbench-theme",
  themes: ["light", "dark"]
} as const satisfies PlannerNextThemesConfig;

export const plannerThemeConfig = {
  nextThemes: plannerNextThemesConfig,
  radixTheme: plannerRadixThemeConfig,
  themeClassName: "planner-theme"
} as const satisfies PlannerThemeConfig;

export type PlannerNextThemesProviderProps = NextThemesProviderProps;
