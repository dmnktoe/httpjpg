import { expect, test } from "@playwright/test";

test.describe("CV language picker", () => {
  test("switches the CV between English and German", async ({ page }) => {
    const response = await page.goto("/cv");
    expect(response?.ok()).toBe(true);

    const picker = page.getByRole("navigation", { name: "Language" });
    await expect(picker).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { name: "CV" })).toBeVisible();
    await expect(picker.getByText("EN")).toHaveAttribute("aria-current", "page");

    await picker.getByRole("link", { name: "DE" }).click();

    await expect(page).toHaveURL(/\/de\/cv\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.getByRole("heading", { name: "Lebenslauf" })).toBeVisible();
    await expect(picker.getByText("DE")).toHaveAttribute("aria-current", "page");

    await picker.getByRole("link", { name: "EN" }).click();

    await expect(page).toHaveURL(/\/cv\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { name: "CV" })).toBeVisible();
  });
});
