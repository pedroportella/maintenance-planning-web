"use client";

import { Theme } from "@radix-ui/themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import {
  plannerThemeConfig,
  type PlannerThemeAppearance
} from "../theme-config";

export type PlannerThemeProviderProps = {
  children: ReactNode;
  defaultAppearance?: PlannerThemeAppearance;
  forcedAppearance?: Exclude<PlannerThemeAppearance, "system">;
  storageKey?: string;
};

export function PlannerThemeProvider({
  children,
  defaultAppearance = plannerThemeConfig.nextThemes.defaultTheme,
  forcedAppearance,
  storageKey = plannerThemeConfig.nextThemes.storageKey
}: PlannerThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={plannerThemeConfig.nextThemes.attribute}
      defaultTheme={defaultAppearance}
      disableTransitionOnChange={plannerThemeConfig.nextThemes.disableTransitionOnChange}
      enableColorScheme={plannerThemeConfig.nextThemes.enableColorScheme}
      enableSystem={plannerThemeConfig.nextThemes.enableSystem}
      forcedTheme={forcedAppearance}
      storageKey={storageKey}
      themes={[...plannerThemeConfig.nextThemes.themes]}
    >
      <Theme
        {...plannerThemeConfig.radixTheme}
        className={plannerThemeConfig.themeClassName}
      >
        {children}
      </Theme>
    </NextThemesProvider>
  );
}
