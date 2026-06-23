export type RadixAdapterTone =
  | "accent"
  | "critical"
  | "info"
  | "neutral"
  | "success"
  | "warning";

export const radixAdapterColorByTone = {
  accent: "teal",
  critical: "red",
  info: "blue",
  neutral: "gray",
  success: "green",
  warning: "amber"
} as const satisfies Record<RadixAdapterTone, string>;
