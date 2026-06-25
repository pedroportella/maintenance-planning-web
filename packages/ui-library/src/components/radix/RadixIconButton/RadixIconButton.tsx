import { IconButton, type IconButtonProps } from "@radix-ui/themes";
import type { ReactNode } from "react";
import { joinClasses } from "../../../utils";
import { radixAdapterColorByTone, type RadixAdapterTone } from "../radix-colors";

export type RadixIconButtonVariant = "ghost" | "outline" | "soft" | "solid" | "surface";

export type RadixIconButtonProps = Omit<
  IconButtonProps,
  "aria-label" | "children" | "color" | "type" | "variant"
> & {
  children: ReactNode;
  label: string;
  tone?: RadixAdapterTone;
  type?: "button" | "reset" | "submit";
  variant?: RadixIconButtonVariant;
};

export function RadixIconButton({
  children,
  className,
  highContrast = true,
  label,
  tone = "accent",
  type = "button",
  variant = "soft",
  ...buttonProps
}: RadixIconButtonProps) {
  const buttonType = buttonProps.asChild ? undefined : type;

  return (
    <IconButton
      aria-label={label}
      className={joinClasses("radix-icon-button", className)}
      color={radixAdapterColorByTone[tone]}
      highContrast={highContrast}
      type={buttonType}
      variant={variant}
      {...buttonProps}
    >
      {children}
    </IconButton>
  );
}
