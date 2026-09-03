// @vitest-environment node
import { beforeEach, describe, expect, it, vi, type MockedFunction } from "vitest";

import { storyblokRequest } from "../../src/index";
import { fetchComponentIds, upsertBlock } from "./block";

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

  it("rejects a malformed response instead of treating it as empty", async () => {
    mockRequest.mockResolvedValueOnce({});

    await expect(fetchComponentIds()).rejects.toThrow("Malformed /components response");
  });

  it("fails loudly when the request fails so upsert can't create duplicates", async () => {
    mockRequest.mockRejectedValueOnce(new Error("boom"));

    await expect(fetchComponentIds()).rejects.toThrow("boom");
  });
});

const def = {
  name: "headline",
  display_name: "Headline",
  group: "Content" as const,
  icon: "block-text-c",
  color: "#000",
  schema: {},
};

describe("upsertBlock", () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it("PUTs when the component already exists", async () => {
    mockRequest
      .mockResolvedValueOnce({
        component_groups: [{ uuid: "g-content", name: "Content" }],
      })
      .mockResolvedValueOnce({});

    await upsertBlock(def, new Map([["headline", 42]]));

    expect(mockRequest).toHaveBeenCalledWith("/components/42", "PUT", {
      component: expect.objectContaining({
        id: 42,
        name: "headline",
        component_group_uuid: "g-content",
      }),
    });
  });

  it("POSTs when the component is new", async () => {
    mockRequest.mockResolvedValueOnce({});

    await upsertBlock(
      { ...def, name: "brand_new", preview_field: "text", preview_tmpl: "{text}" },
      new Map(),
    );

    expect(mockRequest).toHaveBeenCalledWith("/components", "POST", {
      component: expect.objectContaining({
        name: "brand_new",
        is_nestable: true,
        preview_field: "text",
        preview_tmpl: "{text}",
      }),
    });
  });

  it("POSTs a root block even when the group list is empty", async () => {
    mockRequest.mockReset();
    mockRequest.mockResolvedValueOnce({ component_groups: [] }).mockResolvedValueOnce({});

    await upsertBlock(
      { ...def, name: "page", display_name: "", group: "Pages", is_root: true },
      new Map(),
    );

    expect(mockRequest).toHaveBeenCalledWith("/components", "POST", {
      component: expect.objectContaining({ is_root: true, is_nestable: false }),
    });
  });
});
