// @vitest-environment node
import { beforeEach, describe, expect, it, vi, type MockedFunction } from "vitest";

import { storyblokRequest } from "../../src/index";
import { fetchComponentIds } from "./block";

vi.mock("../../src/index", () => ({
  storyblokRequest: vi.fn(),
}));

const mockRequest = storyblokRequest as MockedFunction<typeof storyblokRequest>;

describe("fetchComponentIds", () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it("indexes existing components by name", async () => {
    mockRequest.mockResolvedValueOnce({
      components: [
        { id: 1, name: "page" },
        { id: 2, name: "work_card" },
      ],
    });

    const ids = await fetchComponentIds();

    expect(ids.get("page")).toBe(1);
    expect(ids.get("work_card")).toBe(2);
    expect(ids.size).toBe(2);
  });

  it("lists components exactly once", async () => {
    mockRequest.mockResolvedValueOnce({ components: [] });

    await fetchComponentIds();

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith("/components");
  });

  it("returns an empty map when the response has no components", async () => {
    mockRequest.mockResolvedValueOnce({});

    const ids = await fetchComponentIds();

    expect(ids.size).toBe(0);
  });

  it("fails loudly when the request fails so upsert can't create duplicates", async () => {
    mockRequest.mockRejectedValueOnce(new Error("boom"));

    await expect(fetchComponentIds()).rejects.toThrow("boom");
  });
});
