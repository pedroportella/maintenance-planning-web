import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  colorTokens,
  cssCustomProperties,
  radiusTokens,
  shadowTokens,
  spacingTokens,
  statusToneTokens,
  typographyTokens
} from "../src";

const themeCss = readFileSync(new URL("../src/theme.css", import.meta.url), "utf8");
const primitivePaletteScss = readFileSync(
  new URL("../src/scss/styles/maintenance-primitive-palette.scss", import.meta.url),
  "utf8"
);
const productPaletteScss = readFileSync(
  new URL("../src/scss/styles/planner-product-palette.scss", import.meta.url),
  "utf8"
);

describe("design tokens", () => {
  it("exports the required theme groups", () => {
    expect(colorTokens.page).toBe("#f6f7f2");
    expect(spacingTokens.lg).toBe("1rem");
    expect(radiusTokens.md).toBe("8px");
    expect(typographyTokens.fontFamilySans).toContain("ui-sans-serif");
    expect(shadowTokens.soft).toContain("rgba");
    expect(Object.keys(statusToneTokens)).toEqual([
      "critical",
      "info",
      "neutral",
      "success",
      "warning"
    ]);
  });

  it("declares required CSS custom properties in the theme stylesheet", () => {
    const requiredVariables = [
      cssCustomProperties.color.page,
      cssCustomProperties.color.surface,
      cssCustomProperties.color.text,
      cssCustomProperties.color.textMuted,
      cssCustomProperties.radius.md,
      cssCustomProperties.shadow.soft,
      "--mp-tone-info-text",
      "--mp-tone-success-bg",
      "--mp-tone-warning-border",
      "--mp-tone-critical-accent"
    ];

    for (const variableName of requiredVariables) {
      expect(themeCss).toContain(`${variableName}:`);
    }
  });

  it("publishes Sass palette sources for the UI-library theme bridge", () => {
    expect(primitivePaletteScss).toContain("$maintenance-primitive-palette");
    expect(primitivePaletteScss).toContain("light:");
    expect(primitivePaletteScss).toContain("dark:");
    expect(productPaletteScss).toContain("$planner-product-palette");
    expect(productPaletteScss).toContain("@mixin custom-properties");
    expect(productPaletteScss).toContain("--mp-color-page");
    expect(productPaletteScss).toContain("primitive.color(light, canvas)");
    expect(productPaletteScss).toContain("primitive.color(dark, canvas)");
  });

  it("keeps contrast-critical text and state pairs above accessible thresholds", () => {
    const pairs = [
      [colorTokens.text, colorTokens.page],
      [colorTokens.textMuted, colorTokens.surface],
      ["#ffffff", colorTokens.accent.teal],
      [statusToneTokens.info.text, statusToneTokens.info.background],
      [statusToneTokens.success.text, statusToneTokens.success.background],
      [statusToneTokens.warning.text, statusToneTokens.warning.background],
      [statusToneTokens.critical.text, statusToneTokens.critical.background],
      [statusToneTokens.neutral.text, statusToneTokens.neutral.background]
    ] as const;

    for (const [foreground, background] of pairs) {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminosity = relativeLuminosity(foreground);
  const backgroundLuminosity = relativeLuminosity(background);
  const lighter = Math.max(foregroundLuminosity, backgroundLuminosity);
  const darker = Math.min(foregroundLuminosity, backgroundLuminosity);

  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminosity(hexColor: string) {
  const [red, green, blue] = hexToRgb(hexColor).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function hexToRgb(hexColor: string) {
  const normalized = hexColor.replace("#", "");
  if (!/^[a-f0-9]{6}$/i.test(normalized)) {
    throw new Error(`Expected a six-digit hex color, received ${hexColor}`);
  }

  return [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16));
}
