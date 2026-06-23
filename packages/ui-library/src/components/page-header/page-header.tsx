import type { PlannerPageHeaderProps } from "../../layout/PlannerPageHeader";
import { PlannerPageHeader } from "../../layout/PlannerPageHeader";

export type PageHeaderProps = PlannerPageHeaderProps;

export function PageHeader(props: PageHeaderProps) {
  return <PlannerPageHeader {...props} />;
}
