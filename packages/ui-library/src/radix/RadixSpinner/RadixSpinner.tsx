import { Spinner, type SpinnerProps } from "@radix-ui/themes";
import { joinClasses } from "../../components/shared";

export type RadixSpinnerProps = Omit<SpinnerProps, "children">;

export function RadixSpinner({ className, loading = true, ...spinnerProps }: RadixSpinnerProps) {
  return (
    <Spinner
      className={joinClasses("radix-spinner", className)}
      loading={loading}
      {...spinnerProps}
    />
  );
}
