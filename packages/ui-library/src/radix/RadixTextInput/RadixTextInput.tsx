import { TextField } from "@radix-ui/themes";
import type { ComponentPropsWithoutRef } from "react";
import { joinClasses } from "../../components/shared";

type TextFieldRootProps = ComponentPropsWithoutRef<typeof TextField.Root>;

export type RadixTextInputProps = Omit<TextFieldRootProps, "color">;

export function RadixTextInput({ className, ...inputProps }: RadixTextInputProps) {
  return (
    <TextField.Root
      className={joinClasses("radix-text-input", className)}
      {...inputProps}
    />
  );
}
