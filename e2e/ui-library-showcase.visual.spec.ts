import { expect, test } from "@playwright/test";

const themeStorageKey = "planner-workbench-theme";

const routeEvidence = [
  {
    heading: "Planner Workbench",
    path: "/",
    slug: "home"
  },
  {
    heading: "Recommendations",
    path: "/recommendations",
    slug: "recommendations",
    tableName: "Package recommendation queue"
  },
  {
    disclosureName: /Work orders \(1\)/,
    heading: "PKG-PARTS-REPLAN",
    path: "/recommendations/60000000-0000-4000-8000-000000002200?planningRunId=50000000-0000-4000-8000-000000002200",
    slug: "recommendation-detail"
  },
  {
    heading: "Planning runs",
    path: "/planning-runs",
    slug: "planning-runs",
    tableName: "Planning run list"
  },
  {
    heading: "Planning run detail",
    path: "/planning-runs/50000000-0000-4000-8000-000000002200",
    slug: "planning-run-detail",
    tableName: "Planning run recommendation detail"
  },
  {
    heading: "Work-order backlog",
    path: "/work-order-backlog",
    slug: "work-order-backlog",
    tableName: "Planner work-order triage"
  },
  {
    heading: "Coordination exceptions",
    path: "/coordination-exceptions",
    slug: "coordination-exceptions",
    tableName: "Planner work-order triage"
  },
  {
    heading: "Operations posture",
    path: "/operations-posture",
    slug: "operations-posture",
    tableName: "Operations posture signals"
  },
  {
    heading: "Scenario outcomes",
    path: "/scenario-outcomes",
    slug: "scenario-outcomes",
    tableName: "Synthetic scenario outcomes"
  }
] as const;

test("matches the UI library showcase visual baseline", async ({ page }, testInfo) => {
  await forceProjectTheme(page, testInfo.project.name);
  await page.goto("/ui-library");
  await expect(page.getByRole("heading", { name: "UI library showcase" })).toBeVisible();
  await hideLocalDevChrome(page);
  await expect(page).toHaveScreenshot(`ui-library-showcase-${testInfo.project.name}.png`, {
    fullPage: true
  });
});

test("captures RU8 route rollout visual evidence", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await forceProjectTheme(page, testInfo.project.name);

  for (const route of routeEvidence) {
    await page.goto(route.path);
    await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();

    if (route.tableName) {
      await expect(page.getByRole("table", { name: route.tableName })).toBeVisible();
    }

    if (route.disclosureName) {
      await expect(page.getByRole("button", { name: route.disclosureName })).toBeVisible();
    }

    await hideLocalDevChrome(page);
    await expect(page).toHaveScreenshot(`route-${route.slug}-${testInfo.project.name}.png`, {
      fullPage: true
    });
  }
});

async function forceProjectTheme(page: import("@playwright/test").Page, projectName: string) {
  const theme = projectName.endsWith("-dark") ? "dark" : "light";

  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, value);
    },
    [themeStorageKey, theme]
  );
}

async function hideLocalDevChrome(page: import("@playwright/test").Page) {
  await page.addStyleTag({
    content: `
      nextjs-portal,
      [data-nextjs-dialog-overlay],
      [data-nextjs-dev-tools-button],
      [data-next-badge-root],
      [data-nextjs-toast],
      .__nextjs-dev-overlay {
        display: none !important;
        visibility: hidden !important;
      }
    `
  });
}
