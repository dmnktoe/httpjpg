// @vitest-environment node
import { beforeEach, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

import { revalidateTag } from "next/cache";

import { expireConfig, expireStory } from "./expire";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("expireStory", () => {
  it("expires the story and every list of stories immediately", () => {
    const tags = expireStory("work/foo");
    expect(tags).toEqual(["cms:story:work/foo", "cms:stories"]);
    expect(revalidateTag).toHaveBeenCalledWith("cms:story:work/foo", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("cms:stories", { expire: 0 });
  });
});

describe("expireConfig", () => {
  it("expires the config tag immediately", () => {
    expect(expireConfig()).toEqual(["cms:config"]);
    expect(revalidateTag).toHaveBeenCalledWith("cms:config", { expire: 0 });
  });
});
