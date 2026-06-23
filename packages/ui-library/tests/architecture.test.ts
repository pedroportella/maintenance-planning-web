import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  PlannerAppLayout,
  PlannerDataTable,
  PlannerPage,
  PlannerSideNav,
  PlannerWorkflowLayout,
  RadixFormField,
  RadixTable,
  type AppShellNavItem,
  type PlannerDataTableColumn
} from "../src";

const requiredComponentFolders = [
  "src/layout/PlannerAppLayout",
  "src/layout/PlannerPage",
  "src/layout/PlannerWorkflowLayout",
  "src/layout/PlannerSideNav",
  "src/radix/RadixFormField",
  "src/radix/RadixTable",
  "src/data/PlannerDataTable"
] as const;

const requiredComponentFiles = (componentName: string) => [
  `${componentName}.tsx`,
  `${componentName}.scss`,
  `${componentName}.test.tsx`,
  "index.ts"
];

describe("ui-library Radix adapter architecture", () => {
  it("renders RU-1 public exports from the package root", () => {
    type Row = {
      status: string;
      workOrder: string;
    };

    const navItems: AppShellNavItem[] = [
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
        "div",
        null,
        createElement(
          PlannerPage,
          {
            children: createElement("h1", { id: "page-title" }, "Page"),
            labelledBy: "page-title"
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
      )
    );

    expect(markup).toContain("planner-page");
    expect(markup).toContain("planner-workflow-layout");
    expect(markup).toContain("planner-side-nav");
    expect(markup).toContain("app-shell");
    expect(markup).toContain("radix-form-field");
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
});

function collectSourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const entryPath = join(root, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      return collectSourceFiles(entryPath);
    }

    return [".ts", ".tsx"].includes(extname(entryPath)) && !entryPath.endsWith(".d.ts")
      ? [entryPath]
      : [];
  });
}
