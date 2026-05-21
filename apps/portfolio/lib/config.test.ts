import { config } from "./config";

describe("config", () => {
  it("exposes the app name", () => {
    expect(config.appName).toBe("㋡httpjpg.com");
  });

  it("declares both themes as enabled", () => {
    expect(config.ui.enabledThemes).toEqual(["light", "dark"]);
  });

  it("defaults to the light theme", () => {
    expect(config.ui.defaultTheme).toBe("light");
  });

  it("lists the default theme in the enabled set", () => {
    expect(config.ui.enabledThemes).toContain(config.ui.defaultTheme);
  });
});
