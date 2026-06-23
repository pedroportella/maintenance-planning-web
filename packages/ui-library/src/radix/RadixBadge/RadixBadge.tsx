import { Badge, type BadgeProps } from "@radix-ui/themes";
import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";
import { radixAdapterColorByTone, type RadixAdapterTone } from "../radix-colors";

export type RadixBadgeVariant = "outline" | "soft" | "solid" | "surface";

export type RadixBadgeProps = Omit<BadgeProps, "children" | "color" | "variant"> & {
  children: ReactNode;
  tone?: RadixAdapterTone;
  variant?: RadixBadgeVariant;
};

export function RadixBadge({
  children,
  className,
  tone = "neutral",
  variant = "soft",
  ...badgeProps
}: RadixBadgeProps) {
  return (
    <Badge
      className={joinClasses("radix-badge", className)}
      color={radixAdapterColorByTone[tone]}
      variant={variant}
      {...badgeProps}
    >
      {children}
    </Badge>
  );
}
