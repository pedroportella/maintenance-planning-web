import { Button, type ButtonProps } from "@radix-ui/themes";
import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";
import { radixAdapterColorByTone, type RadixAdapterTone } from "../radix-colors";

export type RadixButtonVariant = "ghost" | "outline" | "soft" | "solid" | "surface";

export type RadixButtonProps = Omit<ButtonProps, "children" | "color" | "type" | "variant"> & {
  children: ReactNode;
  tone?: RadixAdapterTone;
  type?: "button" | "reset" | "submit";
  variant?: RadixButtonVariant;
};

export function RadixButton({
  children,
  className,
  tone = "accent",
  type = "button",
  variant = "solid",
  ...buttonProps
}: RadixButtonProps) {
  const resolvedType = buttonProps.asChild ? undefined : type;

  return (
    <Button
      className={joinClasses("radix-button", className)}
      color={radixAdapterColorByTone[tone]}
      type={resolvedType}
      variant={variant}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}
