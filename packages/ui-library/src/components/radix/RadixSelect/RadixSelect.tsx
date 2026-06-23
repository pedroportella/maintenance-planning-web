import { Select } from "@radix-ui/themes";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { joinClasses } from "../../../utils";

type SelectRootProps = ComponentPropsWithoutRef<typeof Select.Root>;
type SelectTriggerProps = ComponentPropsWithoutRef<typeof Select.Trigger>;

export type RadixSelectOption = {
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

export type RadixSelectProps = Omit<
  SelectRootProps,
  "children" | "onValueChange" | "value"
> & {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
  className?: string;
  id: string;
  onValueChange?: (value: string) => void;
  options: readonly RadixSelectOption[];
  placeholder?: string;
  triggerVariant?: SelectTriggerProps["variant"];
  value?: string;
};

export function RadixSelect({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  className,
  id,
  options,
  placeholder,
  triggerVariant = "surface",
  ...selectProps
}: RadixSelectProps) {
  return (
    <Select.Root {...selectProps}>
      <Select.Trigger
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        className={joinClasses("radix-select-trigger", className)}
        id={id}
        placeholder={placeholder}
        variant={triggerVariant}
      />
      <Select.Content>
        {options.map((option) => (
          <Select.Item disabled={option.disabled} key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
