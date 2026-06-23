import { Link, type LinkProps } from "@radix-ui/themes";
import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";

export type RadixLinkProps = Omit<LinkProps, "children"> & {
  children: ReactNode;
};

export function RadixLink({ children, className, ...linkProps }: RadixLinkProps) {
  return (
    <Link className={joinClasses("radix-link", className)} {...linkProps}>
      {children}
    </Link>
  );
}
