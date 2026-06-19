import { sizeConfig } from "./size-config";

describe("sizeConfig", () => {
  it("exposes a config for every size", () => {
    expect(Object.keys(sizeConfig)).toEqual(expect.arrayContaining(["sm", "md", "lg"]));
    expect(Object.keys(sizeConfig)).toHaveLength(3);
  });

  it("scales width up with size", () => {
    expect(sizeConfig.sm.width).toBeLessThan(sizeConfig.md.width);
    expect(sizeConfig.md.width).toBeLessThan(sizeConfig.lg.width);
  });

  it("defines title and artist font sizes per size", () => {
    for (const cfg of Object.values(sizeConfig)) {
      expect(cfg.fontSize.title).toBeTruthy();
      expect(cfg.fontSize.artist).toBeTruthy();
    }
  });
});
