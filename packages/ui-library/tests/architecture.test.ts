import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  PlannerAppLayout,
  PlannerCheckbox,
  PlannerContentSection,
  PlannerDataTable,
  PlannerRadioCards,
  PlannerRadioGroup,
  PlannerPage,
  PlannerPageHeader,
  PlannerSegmentedNav,
  PlannerSelect,
  PlannerSideNav,
  PlannerTextArea,
  PlannerTextInput,
  PlannerWorkflowLayout,
  RadixBadge,
  RadixButton,
  RadixCallout,
  RadixFormField,
  RadixHeading,
  RadixIcon,
  RadixLink,
  RadixTable,
  RadixText,
  type PlannerAppLayoutNavItem,
  type PlannerDataTableColumn
} from "../src";
import { PlannerThemeProvider } from "../src/theme";

const requiredComponentFolders = [
  "src/theme/PlannerThemeProvider",
  "src/components/layout/PlannerAppLayout",
  "src/components/layout/PlannerContentSection",
  "src/components/layout/PlannerPage",
  "src/components/layout/PlannerPageHeader",
  "src/components/layout/PlannerWorkflowLayout",
  "src/components/layout/PlannerSideNav",
  "src/components/radix/RadixBadge",
  "src/components/radix/RadixButton",
  "src/components/radix/RadixCallout",
  "src/components/radix/RadixCheckbox",
  "src/components/radix/RadixFormField",
  "src/components/radix/RadixHeading",
  "src/components/radix/RadixIcon",
  "src/components/radix/RadixLink",
  "src/components/radix/RadixRadioCards",
  "src/components/radix/RadixRadioGroup",
  "src/components/radix/RadixSelect",
  "src/components/radix/RadixTable",
  "src/components/radix/RadixText",
  "src/components/radix/RadixTextArea",
  "src/components/radix/RadixTextInput",
  "src/components/data/PlannerDataTable",
  "src/components/data/PlannerSegmentedNav",
  "src/components/forms/PlannerCheckbox",
  "src/components/forms/PlannerFormField",
  "src/components/forms/PlannerRadioCards",
  "src/components/forms/PlannerRadioGroup",
  "src/components/forms/PlannerSelect",
  "src/components/forms/PlannerTextArea",
  "src/components/forms/PlannerTextInput"
] as const;

const componentFamilyFolders = [
  "data",
  "feedback",
  "forms",
  "layout",
  "radix",
  "workflow"
] as const;

const legacyAdapterFolders = [
  "alert",
  "app-shell",
  "data-table",
  "empty-state",
  "loading-state",
  "metric-summary",
  "page-header",
  "panel",
  "quiet-note",
  "segmented-nav",
  "status-badge"
] as const;

const requiredComponentFiles = (componentName: string) => [
  `${componentName}.tsx`,
  `${componentName}.scss`,
  `${componentName}.test.tsx`,
  "index.ts"
];

describe("ui-library Radix adapter architecture", () => {
  it("renders RU2 public exports from the package root", () => {
    type Row = {
      status: string;
      workOrder: string;
    };

    const navItems: PlannerAppLayoutNavItem[] = [
      {
        href: "/recommendations",
        label: "Recommendations"
      }
    ];
    const columns: Array<PlannerDataTableColumn<Row>> = [
      {
        header: "Work order",
        key: "work-order",
        render: (row) => row.workOrder
      }
    ];

    const markup = renderToStaticMarkup(
      createElement(
        PlannerThemeProvider,
        {
          children: createElement(
            "div",
            null,
          createElement(
            PlannerPage,
            {
              children: createElement("h1", { id: "page-title" }, "Page"),
              labelledBy: "page-title"
            }
          ),
          createElement(PlannerPageHeader, {
            description: "Route overview",
            title: "Planner page header",
            titleId: "planner-page-header-title"
          }),
          createElement(
            PlannerContentSection,
            {
              children: createElement("p", null, "Section body"),
              title: "Planner content section",
              titleId: "planner-content-section-title"
            }
          ),
          createElement(
            PlannerWorkflowLayout,
            {
              children: createElement("p", null, "Body"),
              title: "Workflow"
            }
          ),
          createElement(PlannerSideNav, {
            activeHref: "/recommendations",
            ariaLabel: "Planner sections",
            items: navItems
          }),
          createElement(PlannerSegmentedNav, {
            ariaLabel: "Planner tabs",
            options: [
              {
                href: "#queue",
                label: "Queue",
                selected: true
              },
              {
                href: "#history",
                label: "History"
              }
            ]
          }),
          createElement(PlannerAppLayout, {
            activeHref: "/recommendations",
            brand: {
              ariaLabel: "Planner home",
              href: "/",
              name: "Planner Workbench"
            },
            children: createElement("main", null, "App body"),
            navAriaLabel: "Planner sections",
            navItems
          }),
          createElement(RadixFormField, {
            children: (controlProps) => createElement("input", controlProps),
            fieldId: "review-note",
            hint: "Synthetic notes only.",
            label: "Review note"
          }),
          createElement(RadixButton, {
            children: "Submit"
          }),
          createElement(RadixLink, {
            children: "Queue",
            href: "/recommendations"
          }),
          createElement(RadixText, {
            as: "p",
            children: "Adapter copy"
          }),
          createElement(RadixHeading, {
            as: "h2",
            children: "Adapters"
          }),
          createElement(RadixBadge, {
            children: "Ready"
          }),
          createElement(RadixIcon, {
            name: "checkCircled"
          }),
          createElement(RadixCallout, {
            children: "Adapter notice",
            title: "Notice"
          }),
          createElement(PlannerTextInput, {
            label: "Search",
            name: "search"
          }),
          createElement(PlannerTextArea, {
            label: "Notes",
            name: "notes"
          }),
          createElement(PlannerSelect, {
            label: "Reason",
            name: "reason",
            options: [
              {
                label: "Parts readiness",
                value: "parts-readiness"
              }
            ]
          }),
          createElement(PlannerRadioGroup, {
            label: "Action",
            name: "action",
            options: [
              {
                label: "Approve",
                value: "approve"
              }
            ]
          }),
          createElement(PlannerRadioCards, {
            label: "Decision",
            name: "decision",
            options: [
              {
                label: "Approve",
                value: "approve"
              }
            ]
          }),
          createElement(PlannerCheckbox, {
            label: "Reviewed",
            name: "reviewed"
          }),
          createElement(
            RadixTable.Root,
            null,
            createElement(
              RadixTable.Body,
              null,
              createElement(
                RadixTable.Row,
                null,
                createElement(RadixTable.Cell, null, "Cell")
              )
            )
          ),
          createElement(PlannerDataTable<Row>, {
            caption: "Queue",
            columns,
            getRowKey: (row) => row.workOrder,
            rows: [
              {
                status: "Ready",
                workOrder: "WO-1000"
              }
            ]
          })
          ),
          forcedAppearance: "light"
        }
      )
    );

    expect(markup).toContain("planner-page");
    expect(markup).toContain("planner-workflow-layout");
    expect(markup).toContain("planner-side-nav");
    expect(markup).toContain("planner-segmented-nav");
    expect(markup).toContain("planner-app-layout");
    expect(markup).toContain("planner-page-header");
    expect(markup).toContain("planner-content-section");
    expect(markup).toContain("radix-form-field");
    expect(markup).toContain("radix-button");
    expect(markup).toContain("radix-link");
    expect(markup).toContain("radix-callout");
    expect(markup).toContain("radix-select-trigger");
    expect(markup).toContain("radix-radio-group");
    expect(markup).toContain("radix-radio-cards");
    expect(markup).toContain("radix-table");
    expect(markup).toContain("WO-1000");
  });

  it("keeps RU-1 component folders on the four-file contract", () => {
    const packageRoot = fileURLToPath(new URL("../", import.meta.url));

    for (const folder of requiredComponentFolders) {
      const componentName = folder.split("/").at(-1);
      expect(componentName).toBeDefined();

      const missingFiles = requiredComponentFiles(componentName ?? "").filter(
        (fileName) => !existsSync(join(packageRoot, folder, fileName))
      );

      expect(missingFiles).toEqual([]);
    }
  });

  it("keeps component families under src/components", () => {
    const packageRoot = fileURLToPath(new URL("../", import.meta.url));
    const sourceRoot = join(packageRoot, "src");
    const allowedRootEntries = new Set(["components", "index.tsx", "theme", "utils"]);

    expect(existsSync(join(sourceRoot, "components"))).toBe(true);

    for (const familyFolder of componentFamilyFolders) {
      expect(existsSync(join(sourceRoot, "components", familyFolder))).toBe(true);
      expect(existsSync(join(sourceRoot, familyFolder))).toBe(false);
    }

    const rootOffenders = readdirSync(sourceRoot).filter(
      (entry) => !allowedRootEntries.has(entry)
    );
    const legacyOffenders = legacyAdapterFolders.filter((folder) =>
      existsSync(join(sourceRoot, "components", folder))
    );

    expect(rootOffenders).toEqual([]);
    expect(legacyOffenders).toEqual([]);
  });

  it("keeps planner route containers out of direct Radix imports", () => {
    const appRoots = [
      fileURLToPath(new URL("../../../apps/planner-workbench/app/", import.meta.url)),
      fileURLToPath(new URL("../../../apps/planner-workbench/containers/", import.meta.url))
    ];
    const directRadixImportPattern =
      /(?:from\s+["']@radix-ui\/|import\s+["']@radix-ui\/|require\(["']@radix-ui\/)/;
    const offenders = appRoots
      .flatMap((root) => collectSourceFiles(root))
      .filter((filePath) => directRadixImportPattern.test(readFileSync(filePath, "utf8")))
      .map((filePath) => relative(fileURLToPath(new URL("../../..", import.meta.url)), filePath));

    expect(offenders).toEqual([]);
  });

  it("keeps Radix imports inside the fidelity adapter and theme boundary", () => {
    const packageRoot = fileURLToPath(new URL("../", import.meta.url));
    const directRadixImportPattern =
      /(?:from\s+["']@radix-ui\/|import\s+["']@radix-ui\/|@import\s+["']@radix-ui\/|require\(["']@radix-ui\/)/;
    const allowedRadixImportPattern =
      /src\/(?:components\/radix\/|theme\/(?:PlannerThemeProvider\/PlannerThemeProvider\.tsx|theme-config\.ts|theme\.scss))/;
    const offenders = collectSourceFiles(join(packageRoot, "src"))
      .filter((filePath) => directRadixImportPattern.test(readFileSync(filePath, "utf8")))
      .map((filePath) => relative(packageRoot, filePath))
      .filter((filePath) => !allowedRadixImportPattern.test(filePath));

    expect(offenders).toEqual([]);
  });
});

function collectSourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const entryPath = join(root, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      return collectSourceFiles(entryPath);
    }

    return [".scss", ".ts", ".tsx"].includes(extname(entryPath)) && !entryPath.endsWith(".d.ts")
      ? [entryPath]
      : [];
  });
}
