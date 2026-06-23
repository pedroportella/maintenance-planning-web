import { Checkbox, type CheckboxProps } from "@radix-ui/themes";
import { joinClasses } from "../../../utils";

export type RadixCheckboxProps = Omit<CheckboxProps, "color">;

export function RadixCheckbox({ className, ...checkboxProps }: RadixCheckboxProps) {
  return (
    <Checkbox
      className={joinClasses("radix-checkbox", className)}
      {...checkboxProps}
    />
  );
}
