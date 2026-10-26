// @vitest-environment node
vi.mock("@httpjpg/env", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://example.test" },
}));

import robots from "./robots";

describe("robots", () => {
  it("allows the root and disallows api + draft URLs", () => {
    const result = robots();
    const rules = result.rules as { allow: string[]; disallow: string[] };
    expect(rules.allow).toContain("/");
    expect(rules.disallow).toContain("/api/*");
  });

  it("allows the image routes pages link to", () => {
    const rules = robots().rules as { allow: string[] };
    expect(rules.allow).toEqual(expect.arrayContaining(["/api/og/", "/api/favicon"]));
  });

  it("points the sitemap at the configured app URL", () => {
    expect(robots().sitemap).toBe("https://example.test/sitemap.xml");
  });
});
