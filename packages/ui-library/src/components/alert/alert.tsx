import { PlannerAlert, type PlannerAlertProps } from "../../feedback";

export type AlertProps = PlannerAlertProps;

export function Alert(props: AlertProps) {
  return <PlannerAlert {...props} />;
}
