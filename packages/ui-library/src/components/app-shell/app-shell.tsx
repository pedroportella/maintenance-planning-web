import {
  PlannerAppLayout,
  type PlannerAppLayoutBrand,
  type PlannerAppLayoutLinkProps,
  type PlannerAppLayoutNavItem,
  type PlannerAppLayoutProps
} from "../../layout/PlannerAppLayout";

export type AppShellBrand = PlannerAppLayoutBrand;
export type AppShellLinkProps = PlannerAppLayoutLinkProps;
export type AppShellNavItem = PlannerAppLayoutNavItem;
export type AppShellProps = PlannerAppLayoutProps;

export function AppShell(props: AppShellProps) {
  return <PlannerAppLayout {...props} />;
}
