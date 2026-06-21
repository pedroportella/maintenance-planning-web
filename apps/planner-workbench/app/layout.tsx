import type { Metadata, Viewport } from "next";
import { PlannerAppShell } from "@/app-shell/planner-app-shell";
import "@maintenance-planning/ui-library/theme.css";
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
    <html lang="en">
      <body>
        <PlannerAppShell>{children}</PlannerAppShell>
      </body>
    </html>
  );
}
