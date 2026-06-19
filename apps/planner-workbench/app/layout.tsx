import type { Metadata, Viewport } from "next";
import { WorkbenchShell } from "@/components/workbench-shell";
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
        <WorkbenchShell>{children}</WorkbenchShell>
      </body>
    </html>
  );
}
