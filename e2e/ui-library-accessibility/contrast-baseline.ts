import type { Page } from "@playwright/test";
import type {
  ContrastTokenPair,
  RenderedContrastSample
} from "./contrast-samples";

type CollectContrastBaselineOptions = {
  readonly renderedContrastSamples: readonly RenderedContrastSample[];
  readonly tones: readonly string[];
  readonly tokenPairs: readonly ContrastTokenPair[];
};

export async function collectContrastBaseline(
  page: Page,
  options: CollectContrastBaselineOptions
) {
  return page.evaluate(({ renderedContrastSamples, tones, tokenPairs }) => {
    type Rgb = {
      alpha: number;
      blue: number;
      green: number;
      red: number;
    };

    function parseCssColor(value: string): Rgb | null {
      const normalized = value.trim();

      if (normalized === "" || normalized === "transparent") {
        return {
          alpha: 0,
          blue: 0,
          green: 0,
          red: 0
        };
      }

      const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/);
      if (rgbMatch) {
        const parts = rgbMatch[1]
          .split(",")
          .map((part) => Number.parseFloat(part.trim().replace("%", "")));

        return {
          alpha: parts[3] ?? 1,
          blue: parts[2] ?? 0,
          green: parts[1] ?? 0,
          red: parts[0] ?? 0
        };
      }

      const shortHexMatch = normalized.match(/^#([a-f0-9]{3})$/i);
      if (shortHexMatch) {
        const [red, green, blue] = shortHexMatch[1]
          .split("")
          .map((channel) => Number.parseInt(`${channel}${channel}`, 16));

        return {
          alpha: 1,
          blue,
          green,
          red
        };
      }

      const hexMatch = normalized.match(/^#([a-f0-9]{6})$/i);
      if (hexMatch) {
        const hex = hexMatch[1];
        return {
          alpha: 1,
          blue: Number.parseInt(hex.slice(4, 6), 16),
          green: Number.parseInt(hex.slice(2, 4), 16),
          red: Number.parseInt(hex.slice(0, 2), 16)
        };
      }

      return null;
    }

    function blend(foreground: Rgb, background: Rgb): Rgb {
      const alpha = foreground.alpha + background.alpha * (1 - foreground.alpha);

      if (alpha === 0) {
        return {
          alpha: 0,
          blue: 0,
          green: 0,
          red: 0
        };
      }

      return {
        alpha,
        blue:
          (foreground.blue * foreground.alpha +
            background.blue * background.alpha * (1 - foreground.alpha)) /
          alpha,
        green:
          (foreground.green * foreground.alpha +
            background.green * background.alpha * (1 - foreground.alpha)) /
          alpha,
        red:
          (foreground.red * foreground.alpha +
            background.red * background.alpha * (1 - foreground.alpha)) /
          alpha
      };
    }

    function relativeLuminance(color: Pick<Rgb, "blue" | "green" | "red">) {
      const [red, green, blue] = [color.red, color.green, color.blue].map((channel) => {
        const normalized = channel / 255;

        return normalized <= 0.03928
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });

      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    }

    function contrastRatio(
      first: Pick<Rgb, "blue" | "green" | "red">,
      second: Pick<Rgb, "blue" | "green" | "red">
    ) {
      const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
      const darker = Math.min(relativeLuminance(first), relativeLuminance(second));

      return (lighter + 0.05) / (darker + 0.05);
    }

    function findCompositedBackground(target: Element) {
      let current: Element | null = target;
      const backgrounds: Rgb[] = [];

      while (current) {
        const background = parseCssColor(getComputedStyle(current).backgroundColor);

        if (background && background.alpha > 0) {
          backgrounds.push(background);
        }

        if (background?.alpha === 1) {
          break;
        }

        current = current.parentElement;
      }

      return backgrounds.reverse().reduce((result, background) => blend(background, result), {
        alpha: 1,
        blue: 255,
        green: 255,
        red: 255
      });
    }

    function resolveCssVariable(styles: CSSStyleDeclaration, token: string, depth = 0): string {
      if (depth > 6) {
        return "";
      }

      const value = styles.getPropertyValue(token).trim();
      const variableReference = value.match(/^var\((--[^,\s)]+)/);

      return variableReference
        ? resolveCssVariable(styles, variableReference[1], depth + 1)
        : value;
    }

    function tokenColor(styles: CSSStyleDeclaration, token: string) {
      return parseCssColor(resolveCssVariable(styles, token));
    }

    function roundedRatio(ratio: number) {
      return Math.round(ratio * 100) / 100;
    }

    const themeRoot = document.querySelector(".planner-theme") ?? document.documentElement;
    const themeStyles = getComputedStyle(themeRoot);

    const tokenResults = tokenPairs.map((sample) => {
      const foreground = tokenColor(themeStyles, sample.foreground);
      const background = tokenColor(themeStyles, sample.background);
      const ratio =
        foreground && background
          ? roundedRatio(contrastRatio(blend(foreground, background), background))
          : null;

      return {
        ...sample,
        found: Boolean(foreground && background),
        pass: ratio === null ? false : ratio >= sample.threshold,
        ratio
      };
    });

    const renderedResults = [
      ...renderedContrastSamples.map((sample) => {
        const element = document.querySelector(sample.selector);
        if (!element) {
          return {
            ...sample,
            found: false,
            pass: false,
            ratio: null
          };
        }

        const background = findCompositedBackground(element);
        const foreground = parseCssColor(getComputedStyle(element, sample.pseudoElement).color);
        const ratio = foreground
          ? roundedRatio(contrastRatio(blend(foreground, background), background))
          : null;

        return {
          ...sample,
          found: true,
          pass: ratio === null ? false : ratio >= sample.threshold,
          ratio
        };
      }),
      ...tones
        .flatMap((tone) => [
          {
            label: `${tone} status badge`,
            selector: `.planner-status-badge-${tone}`,
            threshold: 4.5
          },
          {
            label: `${tone} alert title`,
            selector: `.planner-alert-${tone}:not(.light):not(.dark) .radix-callout-title`,
            threshold: 4.5
          },
          {
            label: `${tone} alert body`,
            selector: `.planner-alert-${tone}:not(.light):not(.dark) p`,
            threshold: 4.5
          }
        ])
        .map((sample) => {
          const element = document.querySelector(sample.selector);
          if (!element) {
            return {
              ...sample,
              found: false,
              pass: false,
              ratio: null
            };
          }

          const background = findCompositedBackground(element);
          const foreground = parseCssColor(getComputedStyle(element).color);
          const ratio = foreground
            ? roundedRatio(contrastRatio(blend(foreground, background), background))
            : null;

          return {
            ...sample,
            found: true,
            pass: ratio === null ? false : ratio >= sample.threshold,
            ratio
          };
        })
    ];

    return {
      renderedResults,
      tokenResults
    };
  }, options);
}
