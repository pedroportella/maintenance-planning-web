import type { ReactNode } from "react";
import { joinClasses } from "../shared";

type PanelElement = "article" | "div" | "section";

export type WorkbenchPanelProps = {
  as?: PanelElement;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
};

export function WorkbenchPanel({
  as = "section",
  children,
  className,
  labelledBy
}: WorkbenchPanelProps) {
  const Component = as;

  return (
    <Component aria-labelledby={labelledBy} className={joinClasses("workbench-panel", className)}>
      {children}
    </Component>
  );
}
