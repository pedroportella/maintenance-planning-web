export const colorTokens = {
  page: "#f6f7f2",
  surface: "#ffffff",
  surfaceRaised: "#fbfcf8",
  surfaceMuted: "#eef3ee",
  border: "#d8ded5",
  borderStrong: "#b9c4bb",
  text: "#17211b",
  textMuted: "#4f5b52",
  accent: {
    amber: "#b45309",
    blue: "#2563eb",
    red: "#b42318",
    teal: "#0f766e",
    violet: "#6d28d9"
  },
  soft: {
    amber: "#fef3c7",
    blue: "#dbeafe",
    red: "#fee4e2",
    teal: "#d9f1ec",
    violet: "#ede9fe"
  }
} as const;

export const spacingTokens = {
  none: "0",
  xxs: "0.125rem",
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.75rem",
  "4xl": "2rem",
  "5xl": "2.5rem",
  "6xl": "3rem"
} as const;

export const radiusTokens = {
  none: "0",
  sm: "4px",
  md: "8px",
  pill: "999px"
} as const;

export const typographyTokens = {
  fontFamilySans:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSizeXs: "0.78rem",
  fontSizeSm: "0.84rem",
  fontSizeMd: "1rem",
  fontSizeLg: "1.35rem",
  fontSizeXl: "2rem",
  fontSizeDisplay: "2.6rem",
  lineHeightTight: "1.1",
  lineHeightBase: "1.55"
} as const;

export const shadowTokens = {
  soft: "0 18px 40px rgba(23, 33, 27, 0.08)",
  focus: "0 0 0 3px rgba(15, 118, 110, 0.24)"
} as const;

export const statusToneTokens = {
  critical: {
    accent: colorTokens.accent.red,
    background: colorTokens.soft.red,
    border: "#fecaca",
    text: "#9f1d16"
  },
  info: {
    accent: colorTokens.accent.blue,
    background: colorTokens.soft.blue,
    border: "#bfdbfe",
    text: "#1d4ed8"
  },
  neutral: {
    accent: colorTokens.accent.violet,
    background: colorTokens.surfaceMuted,
    border: colorTokens.border,
    text: "#405046"
  },
  success: {
    accent: colorTokens.accent.teal,
    background: colorTokens.soft.teal,
    border: "#a7e3d8",
    text: "#0b665f"
  },
  warning: {
    accent: colorTokens.accent.amber,
    background: colorTokens.soft.amber,
    border: "#fde68a",
    text: "#92400e"
  }
} as const;

export type ColorTokenName = keyof typeof colorTokens;
export type RadiusTokenName = keyof typeof radiusTokens;
export type SpacingTokenName = keyof typeof spacingTokens;
export type StatusToneName = keyof typeof statusToneTokens;

export const cssCustomProperties = {
  color: {
    border: "--mp-color-border",
    borderStrong: "--mp-color-border-strong",
    page: "--mp-color-page",
    surface: "--mp-color-surface",
    surfaceMuted: "--mp-color-surface-muted",
    surfaceRaised: "--mp-color-surface-raised",
    text: "--mp-color-text",
    textMuted: "--mp-color-text-muted"
  },
  radius: {
    md: "--mp-radius-md",
    pill: "--mp-radius-pill",
    sm: "--mp-radius-sm"
  },
  shadow: {
    focus: "--mp-shadow-focus",
    soft: "--mp-shadow-soft"
  },
  tone: {
    critical: "--mp-tone-critical",
    info: "--mp-tone-info",
    neutral: "--mp-tone-neutral",
    success: "--mp-tone-success",
    warning: "--mp-tone-warning"
  }
} as const;

export const workbenchTokens = {
  colorPage: colorTokens.page,
  colorSurface: colorTokens.surface,
  colorText: colorTokens.text,
  colorTextMuted: colorTokens.textMuted,
  colorTeal: colorTokens.accent.teal,
  colorBlue: colorTokens.accent.blue,
  colorAmber: colorTokens.accent.amber,
  colorRed: colorTokens.accent.red,
  colorViolet: colorTokens.accent.violet,
  radiusCard: radiusTokens.md,
  shadowSoft: shadowTokens.soft
} as const;

export type WorkbenchTokenName = keyof typeof workbenchTokens;
