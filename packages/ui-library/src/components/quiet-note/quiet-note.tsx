import { PlannerQuietNote, type PlannerQuietNoteProps } from "../../feedback";

export type QuietNoteProps = PlannerQuietNoteProps;

export function QuietNote(props: QuietNoteProps) {
  return <PlannerQuietNote {...props} />;
}
