// @vitest-environment node
vi.mock("@httpjpg/env", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://example.test" },
}));

import robots from "./robots";

describe("robots", () => {
  it("allows the root and disallows api + draft URLs", () => {
    const result = robots();
    const rules = result.rules as { allow: string; disallow: string[] };
    expect(rules.allow).toBe("/");
    expect(rules.disallow).toContain("/api/*");
  });

  it("points the sitemap at the configured app URL", () => {
    expect(robots().sitemap).toBe("https://example.test/sitemap.xml");
  });
});
