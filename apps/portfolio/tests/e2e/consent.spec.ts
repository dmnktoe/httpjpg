import { expect, type Page, test } from "@playwright/test";

const CONSENT_COOKIE = "httpjpg_consent";

function banner(page: Page) {
  return page.getByRole("button", { name: /Accept All/ });
}

async function consentCookie(page: Page) {
  const cookies = await page.context().cookies();
  return cookies.find((cookie) => cookie.name === CONSENT_COOKIE);
}

test.describe("cookie consent", () => {
  test("banner greets a first-time visitor and Accept All survives a reload", async ({ page }) => {
    await page.goto("/");

    await expect(banner(page)).toBeVisible();
    expect(await consentCookie(page)).toBeUndefined();

    await banner(page).click();
    await expect(banner(page)).toHaveCount(0);

    const cookie = await consentCookie(page);
    expect(cookie).toBeDefined();
    const stored = JSON.parse(decodeURIComponent(cookie?.value ?? "{}"));
    expect(stored.consent).toMatchObject({
      analytics: true,
      monitoring: true,
      preferences: true,
      media: true,
    });

    // A decision the banner forgets on reload is a decision that was never made.
    await page.reload();
    await expect(banner(page)).toHaveCount(0);
  });

  test("Reject All records a decision without granting the optional categories", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(banner(page)).toBeVisible();

    await page.getByRole("button", { name: /Reject All/ }).click();
    await expect(banner(page)).toHaveCount(0);

    const cookie = await consentCookie(page);
    expect(cookie).toBeDefined();
    const stored = JSON.parse(decodeURIComponent(cookie?.value ?? "{}"));
    expect(stored.consent).toMatchObject({ analytics: false, media: false });
    // Required categories stay on — the site cannot function without them.
    expect(stored.consent).toMatchObject({ preferences: true, monitoring: true });

    await page.reload();
    await expect(banner(page)).toHaveCount(0);
  });

  test("Customize exposes the categories and locks the required ones", async ({ page }) => {
    await page.goto("/");
    // The banner copy links to "Customize" too; target the action button itself.
    await page.getByRole("button", { name: "⚙ Customize" }).click();

    const checkboxes = page.getByRole("checkbox");
    await expect(checkboxes).toHaveCount(4);

    // Every "(Required)" category must be checked and non-interactive.
    const required = page.getByRole("checkbox", { name: /\(Required\)/ });
    const requiredCount = await required.count();
    expect(requiredCount).toBeGreaterThan(0);
    for (let index = 0; index < requiredCount; index++) {
      await expect(required.nth(index)).toBeChecked();
      await expect(required.nth(index)).toBeDisabled();
    }

    const optional = page.getByRole("checkbox", { name: /^(?!.*\(Required\)).*$/ }).first();
    await expect(optional).not.toBeChecked();

    // The input itself is visually hidden behind a styled glyph, so toggle it
    // the way a visitor does — through its text label.
    const optionalId = await optional.getAttribute("id");
    await page.locator(`label[for="${optionalId}"]`).last().click();
    await expect(optional).toBeChecked();

    await page.getByRole("button", { name: /Save Preferences/ }).click();
    await expect(banner(page)).toHaveCount(0);

    const cookie = await consentCookie(page);
    const stored = JSON.parse(decodeURIComponent(cookie?.value ?? "{}"));
    expect(Object.values(stored.consent).filter(Boolean).length).toBeGreaterThan(2);
  });
});
