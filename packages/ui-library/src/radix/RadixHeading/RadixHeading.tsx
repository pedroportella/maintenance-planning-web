import { Heading, type HeadingProps } from "@radix-ui/themes";
import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";

export type RadixHeadingProps = Omit<HeadingProps, "children"> & {
  children: ReactNode;
};

export function RadixHeading({
  as = "h2",
  children,
  className,
  size = "5",
  weight = "bold",
  ...headingProps
}: RadixHeadingProps) {
  return (
    <Heading
      as={as}
      className={joinClasses("radix-heading", className)}
      size={size}
      weight={weight}
      {...headingProps}
    >
      {children}
    </Heading>
  );
}
