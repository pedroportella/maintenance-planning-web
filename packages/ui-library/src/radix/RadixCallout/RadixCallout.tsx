import { Callout } from "@radix-ui/themes";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { joinClasses } from "../../components/shared";
import { RadixIcon, type RadixIconName } from "../RadixIcon";
import { radixAdapterColorByTone, type RadixAdapterTone } from "../radix-colors";

type CalloutRootProps = ComponentPropsWithoutRef<typeof Callout.Root>;

const iconByTone = {
  accent: "infoCircled",
  critical: "crossCircled",
  info: "infoCircled",
  neutral: "reader",
  success: "checkCircled",
  warning: "exclamationTriangle"
} as const satisfies Record<RadixAdapterTone, RadixIconName>;

export type RadixCalloutProps = Omit<CalloutRootProps, "children" | "color" | "title"> & {
  children: ReactNode;
  iconName?: RadixIconName;
  title?: ReactNode;
  tone?: RadixAdapterTone;
};

export function RadixCallout({
  children,
  className,
  iconName,
  role,
  title,
  tone = "info",
  ...calloutProps
}: RadixCalloutProps) {
  const resolvedRole = role ?? (tone === "critical" || tone === "warning" ? "alert" : "status");

  return (
    <Callout.Root
      className={joinClasses("radix-callout", className)}
      color={radixAdapterColorByTone[tone]}
      role={resolvedRole}
      {...calloutProps}
    >
      <Callout.Icon>
        <RadixIcon name={iconName ?? iconByTone[tone]} />
      </Callout.Icon>
      <div className="rt-CalloutText radix-callout-content">
        {title ? <strong className="radix-callout-title">{title}</strong> : null}
        <div className="radix-callout-body">{children}</div>
      </div>
    </Callout.Root>
  );
}
