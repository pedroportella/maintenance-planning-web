import type { Metadata, Viewport } from "next";
import { PlannerAppShell } from "@/app-shell/planner-app-shell";
import { PlannerThemeProvider } from "@maintenance-planning/ui-library/theme";
import "@maintenance-planning/ui-library/theme.scss";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planner Workbench",
  description: "Synthetic maintenance-planning workbench for planner review flows."
};

export const viewport: Viewport = {
  themeColor: "#f6f7f2"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PlannerThemeProvider>
          <PlannerAppShell>{children}</PlannerAppShell>
        </PlannerThemeProvider>
      </body>
    </html>
  );
}
