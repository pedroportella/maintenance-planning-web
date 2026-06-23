import { Text, type TextProps } from "@radix-ui/themes";
import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";
import { radixAdapterColorByTone, type RadixAdapterTone } from "../radix-colors";

export type RadixTextTone = RadixAdapterTone | "default" | "muted";

export type RadixTextProps = {
  "aria-label"?: string;
  as?: "div" | "label" | "p" | "span";
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  id?: string;
  size?: TextProps["size"];
  tone?: RadixTextTone;
  weight?: TextProps["weight"];
};

function getTextColor(tone: RadixTextTone) {
  if (tone === "default") {
    return undefined;
  }

  if (tone === "muted") {
    return "gray";
  }

  return radixAdapterColorByTone[tone];
}

export function RadixText({
  as = "span",
  children,
  className,
  htmlFor,
  tone = "default",
  ...textProps
}: RadixTextProps) {
  const props = {
    "aria-label": textProps["aria-label"],
    className: joinClasses("radix-text", className),
    color: getTextColor(tone),
    id: textProps.id,
    size: textProps.size,
    weight: textProps.weight
  };

  if (as === "div") {
    return (
      <Text as="div" {...props}>
        {children}
      </Text>
    );
  }

  if (as === "label") {
    return (
      <Text as="label" htmlFor={htmlFor} {...props}>
        {children}
      </Text>
    );
  }

  if (as === "p") {
    return (
      <Text as="p" {...props}>
        {children}
      </Text>
    );
  }

  return (
    <Text as="span" {...props}>
      {children}
    </Text>
  );
}
