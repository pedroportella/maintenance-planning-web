import type { AppShellProps } from "../../components/app-shell/app-shell";
import { AppShell } from "../../components/app-shell/app-shell";

export type PlannerAppLayoutProps = AppShellProps;

export function PlannerAppLayout(props: PlannerAppLayoutProps) {
  return <AppShell {...props} />;
}
