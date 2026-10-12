// @vitest-environment node
const { getSiteConfig, getSeoDefaults } = vi.hoisted(() => ({
  getSiteConfig: vi.fn(),
  getSeoDefaults: vi.fn(),
}));

vi.mock("@/lib/queries/config", () => ({ getSiteConfig, getSeoDefaults }));

import manifest from "./manifest";

describe("manifest", () => {
  it("names the app from the CMS config", async () => {
    getSiteConfig.mockResolvedValueOnce({ name: "httpjpg", htmlLang: "de" });
    getSeoDefaults.mockResolvedValueOnce({ title: "httpjpg — portfolio", description: "D" });

    const result = await manifest();

    expect(result).toMatchObject({
      name: "httpjpg — portfolio",
      short_name: "httpjpg",
      description: "D",
      start_url: "/",
      lang: "de",
    });
    expect(result.icons).toEqual([{ src: "/icon.png", sizes: "254x254", type: "image/png" }]);
  });

  it("tolerates an empty config", async () => {
    getSiteConfig.mockResolvedValueOnce({});
    getSeoDefaults.mockResolvedValueOnce({});

    const result = await manifest();

    expect(result.name).toBe("");
    expect(result).not.toHaveProperty("lang");
  });
});
