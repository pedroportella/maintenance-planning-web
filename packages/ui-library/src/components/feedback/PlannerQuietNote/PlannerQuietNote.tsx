import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";
import { RadixIcon, RadixText } from "../../radix";

export type PlannerQuietNoteProps = {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
};

export function PlannerQuietNote({ children, className, title }: PlannerQuietNoteProps) {
  return (
    <aside className={joinClasses("planner-quiet-note", className)}>
      <RadixIcon className="planner-quiet-note-icon" decorative name="reader" />
      <div className="planner-quiet-note-copy">
        {title ? (
          <RadixText as="span" className="planner-quiet-note-title" weight="bold">
            {title}
          </RadixText>
        ) : null}
        <RadixText as="div" className="planner-quiet-note-body" tone="muted">
          {children}
        </RadixText>
      </div>
    </aside>
  );
}
