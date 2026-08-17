import {
  parseSearchParams,
  SEARCH_DEFAULT_LIMIT,
  SEARCH_MAX_LIMIT,
  searchResponseSchema,
} from "./schemas";

describe("parseSearchParams", () => {
  it("trims and caps the query", () => {
    const params = new URLSearchParams({ q: `  ${"x".repeat(200)}  ` });
    const { query } = parseSearchParams(params);
    expect(query).toHaveLength(120);
  });

  it("defaults a missing or invalid limit", () => {
    expect(parseSearchParams(new URLSearchParams()).limit).toBe(SEARCH_DEFAULT_LIMIT);
    expect(parseSearchParams(new URLSearchParams("limit=abc")).limit).toBe(SEARCH_DEFAULT_LIMIT);
  });

  it("clamps an oversized limit", () => {
    expect(parseSearchParams(new URLSearchParams("limit=999")).limit).toBe(SEARCH_MAX_LIMIT);
  });
});

describe("searchResponseSchema", () => {
  it("accepts a palette payload", () => {
    const parsed = searchResponseSchema.safeParse({
      results: [{ id: "1", href: "/work/demo", title: "Demo", kind: "work" }],
      suggestions: ["Demo"],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a malformed payload", () => {
    expect(searchResponseSchema.safeParse({ results: "nope" }).success).toBe(false);
  });
});
