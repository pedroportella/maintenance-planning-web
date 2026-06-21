import type { ReactNode } from "react";
import { joinClasses } from "../shared";

export type QuietNoteProps = {
  children: ReactNode;
  className?: string;
  title?: string;
};

export function QuietNote({ children, className, title }: QuietNoteProps) {
  return (
    <aside className={joinClasses("quiet-note", className)}>
      {title ? <strong>{title}</strong> : null}
      <div>{children}</div>
    </aside>
  );
}
