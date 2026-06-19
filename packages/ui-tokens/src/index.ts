export const workbenchTokens = {
  colorPage: "#f6f7f2",
  colorSurface: "#ffffff",
  colorText: "#17211b",
  colorTeal: "#0f766e",
  colorBlue: "#2563eb",
  colorAmber: "#b45309",
  colorRed: "#b42318"
} as const;

export type WorkbenchTokenName = keyof typeof workbenchTokens;
