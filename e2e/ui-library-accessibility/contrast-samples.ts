export const themes = ["light", "dark"] as const;
export type UiLibraryTheme = (typeof themes)[number];

export const tones = ["critical", "info", "neutral", "success", "warning"] as const;

export type ContrastTokenPair = {
  readonly background: string;
  readonly foreground: string;
  readonly label: string;
  readonly threshold: number;
};

export type RenderedContrastSample = {
  readonly label: string;
  readonly pseudoElement?: string;
  readonly selector: string;
  readonly threshold: number;
};

export const contrastTokenPairs = [
  {
    background: "--mp-color-background",
    foreground: "--mp-color-text-default",
    label: "page text",
    threshold: 4.5
  },
  {
    background: "--mp-color-surface-default",
    foreground: "--mp-color-text-subtle",
    label: "muted surface text",
    threshold: 4.5
  },
  {
    background: "--mp-color-surface-elevated",
    foreground: "--mp-color-text-default",
    label: "raised surface text",
    threshold: 4.5
  },
  {
    background: "--mp-color-background",
    foreground: "--mp-color-focus",
    label: "focus on page",
    threshold: 3
  },
  {
    background: "--mp-color-surface-default",
    foreground: "--mp-color-focus",
    label: "focus on surface",
    threshold: 3
  },
  {
    background: "--mp-color-surface-elevated",
    foreground: "--mp-color-focus",
    label: "focus on raised surface",
    threshold: 3
  },
  {
    background: "--mp-color-surface-subtle",
    foreground: "--mp-color-focus",
    label: "focus on muted surface",
    threshold: 3
  },
  {
    background: "--mp-tone-info-bg",
    foreground: "--mp-tone-info-text",
    label: "info tone text",
    threshold: 4.5
  },
  {
    background: "--mp-tone-success-bg",
    foreground: "--mp-tone-success-text",
    label: "success tone text",
    threshold: 4.5
  },
  {
    background: "--mp-tone-warning-bg",
    foreground: "--mp-tone-warning-text",
    label: "warning tone text",
    threshold: 4.5
  },
  {
    background: "--mp-tone-critical-bg",
    foreground: "--mp-tone-critical-text",
    label: "critical tone text",
    threshold: 4.5
  },
  {
    background: "--mp-tone-neutral-bg",
    foreground: "--mp-tone-neutral-text",
    label: "neutral tone text",
    threshold: 4.5
  }
] as const satisfies readonly ContrastTokenPair[];

export const renderedContrastSamples = [
  {
    label: "page heading",
    selector: "#ui-library-title",
    threshold: 4.5
  },
  {
    label: "muted page header text",
    selector: ".planner-page-header-description",
    threshold: 4.5
  },
  {
    label: "primary action button",
    selector: ".radix-button:not([disabled])",
    threshold: 4.5
  },
  {
    label: "disabled action button",
    selector: ".radix-button[disabled]",
    threshold: 3
  },
  {
    label: "text input",
    selector: "input[name='showcaseSearch']",
    threshold: 4.5
  },
  {
    label: "input placeholder",
    pseudoElement: "::placeholder",
    selector: "input[name='showcaseSearch']",
    threshold: 4.5
  },
  {
    label: "radio card label",
    selector: ".radix-radio-card-label",
    threshold: 4.5
  }
] as const satisfies readonly RenderedContrastSample[];
