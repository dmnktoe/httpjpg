import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("should open GitHub link in new tab", async ({ page, context }) => {
    await page.goto("/");

    // Find GitHub link
    const githubLink = page.getByRole("link", { name: /github/i });
    await expect(githubLink).toBeVisible();

    // Verify it has correct href
    await expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/dmnktoe",
    );

    // Verify it opens in new tab (has target="_blank")
    await expect(githubLink).toHaveAttribute("target", "_blank");

    // Click and wait for new page to open
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      githubLink.click(),
    ]);

    // Verify new page URL
    await expect(newPage).toHaveURL("https://github.com/dmnktoe");
  });
});
