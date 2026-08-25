import { expect, test } from "@playwright/test";

const publicRoutes = ["/", "/products", "/cart", "/blog", "/offline"];

test.describe("storefront smoke", () => {
  for (const route of publicRoutes) {
    test(`${route} renders without a server error`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${route} response`).toBe(200);
      await expect(page.locator("body")).not.toContainText("Internal Server Error");
      await expect(page.locator("main")).toBeVisible();
    });
  }

  test("products page supports a responsive viewport without horizontal overflow", async ({ page }) => {
    await page.goto("/products", { waitUntil: "networkidle" });
    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
  });

  test("public metadata endpoints are available", async ({ request }) => {
    for (const route of ["/robots.txt", "/sitemap.xml", "/manifest.json"]) {
      const response = await request.get(route);
      expect(response.status(), `${route} response`).toBe(200);
    }
  });

  test("protected order API rejects unauthenticated requests", async ({ request }) => {
    const response = await request.post("/api/orders", {
      data: { items: [] },
    });
    expect(response.status()).toBe(401);
  });
});
