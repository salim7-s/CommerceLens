import { test, expect } from "@playwright/test";

test.describe("CommerceLens Happy Path E2E Workflow", () => {
  test("improves weak product, reaches score >= 80, marks ready, and syncs idempotently", async ({ page }) => {
    // 1. Visit Products Catalog
    await page.goto("/products");
    await expect(page.locator("text=Product Catalog")).toBeVisible();

    // 2. Open the weak 'shoe' product
    const improveButton = page.locator("tr", { hasText: "SHOE-RED-001" }).locator("text=Improve");
    await improveButton.click();
    await expect(page).toHaveURL(/\/products\/prod_shoe_001\/improve/);

    // 3. Verify Cloudinary variants gallery is loaded
    await expect(page.locator("text=Cloudinary Media Engine")).toBeVisible();
    await expect(page.locator("text=Thumbnail")).toBeVisible();
    await expect(page.locator("text=Product Card Frame")).toBeVisible();

    // 4. Trigger AI Analysis
    const analyzeBtn = page.locator("button", { hasText: "Analyze Product (AI)" });
    await analyzeBtn.click();

    // 5. Verify suggestions panel populates
    await expect(page.locator("text=Classic Red Canvas Low-Top Sneakers")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Accept All")).toBeVisible();

    // 6. Accept all AI suggestions
    await page.locator("button", { hasText: "Accept All" }).first().click();

    // 7. Verify Health Score increases and reaches >= 80
    await expect(page.locator("text=85 / 100")).toBeVisible({ timeout: 5000 });

    // 8. Mark Ready for WooCommerce
    const markReadyBtn = page.locator("button", { hasText: "Mark Ready" });
    await markReadyBtn.click();
    await expect(page.locator("text=Marked Ready")).toBeVisible();

    // 9. Sync to WooCommerce
    const syncBtn = page.locator("button", { hasText: "Sync to WooCommerce" });
    await syncBtn.click();
    await expect(page.locator("text=Published to WooCommerce!")).toBeVisible({ timeout: 5000 });

    // 10. Verify audit log entry in /sync-log
    await page.goto("/sync-log");
    await expect(page.locator("text=WooCommerce Sync Audit Log")).toBeVisible();
    await expect(page.locator("text=SHOE-RED-001")).toBeVisible();
    await expect(page.locator("text=Synced")).toBeVisible();
  });
});
