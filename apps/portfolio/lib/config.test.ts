import { config } from "./config";

describe("config", () => {
  it("exposes the app name", () => {
    expect(config.appName).toBe("㋡httpjpg.com");
  });
});
