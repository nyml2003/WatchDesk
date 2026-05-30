import { test, expect, _electron as electron } from "@playwright/test";

test("app launches and counter is visible", async () => {
  const app = await electron.launch({ args: ["."], cwd: "packages/desktop" });
  const page = await app.firstWindow();

  await page.waitForSelector("[data-testid='counter-value']");
  await expect(page.locator("[data-testid='counter-value']")).toHaveText("0");

  await page.locator("button:has-text('+')").click();
  await expect(page.locator("[data-testid='counter-value']")).toHaveText("1");

  await app.close();
});
