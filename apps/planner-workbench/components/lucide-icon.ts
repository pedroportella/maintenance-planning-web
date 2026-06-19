import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  FlaskConical,
  Lightbulb,
  Route,
  type LucideIcon
} from "lucide-react";
import type { WorkbenchIconName } from "@maintenance-planning/ui-assets";

const lucideIconComponents = {
  activity: Activity,
  "alert-triangle": AlertTriangle,
  "arrow-right": ArrowRight,
  "calendar-clock": CalendarClock,
  "clipboard-check": ClipboardCheck,
  "clipboard-list": ClipboardList,
  "flask-conical": FlaskConical,
  lightbulb: Lightbulb,
  route: Route
} satisfies Record<WorkbenchIconName, LucideIcon>;

export function getLucideIcon(name: WorkbenchIconName) {
  return lucideIconComponents[name];
}
