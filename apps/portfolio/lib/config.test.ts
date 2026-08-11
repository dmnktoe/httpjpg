import { config } from "./config";

describe("config", () => {
  it("exposes the app name", () => {
    expect(config.appName).toBe("㋡httpjpg.com");
  });

  it("carries the fallbacks the General tab overrides", () => {
    expect(config.locale).toBe("de_DE");
    expect(config.repositoryUrl).toBe("https://github.com/dmnktoe/httpjpg");
  });
});
