import { Skeleton, type SkeletonProps } from "@radix-ui/themes";
import type { ReactNode } from "react";
import { joinClasses } from "../../components/shared";

export type RadixSkeletonProps = Omit<SkeletonProps, "children"> & {
  children?: ReactNode;
};

export function RadixSkeleton({
  children,
  className,
  loading = true,
  ...skeletonProps
}: RadixSkeletonProps) {
  return (
    <Skeleton
      className={joinClasses("radix-skeleton", className)}
      loading={loading}
      {...skeletonProps}
    >
      {children}
    </Skeleton>
  );
}
