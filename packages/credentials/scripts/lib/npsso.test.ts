// @vitest-environment node

import { parseNpsso } from "./npsso";

describe("parseNpsso", () => {
  it("takes a bare cookie value", () => {
    expect(parseNpsso("abc123")).toBe("abc123");
  });

  it("trims surrounding whitespace and quotes", () => {
    expect(parseNpsso('  "abc123"  ')).toBe("abc123");
    expect(parseNpsso("'abc123'")).toBe("abc123");
  });

  it("unwraps the JSON body the ssocookie endpoint renders", () => {
    expect(parseNpsso('{"npsso":"abc123"}')).toBe("abc123");
    expect(parseNpsso('  { "npsso": "abc123" } ')).toBe("abc123");
  });

  it("rejects empty input", () => {
    expect(parseNpsso("")).toBeNull();
    expect(parseNpsso("   ")).toBeNull();
    expect(parseNpsso('""')).toBeNull();
  });

  it("rejects a JSON body without a usable npsso field", () => {
    expect(parseNpsso('{"error":"not signed in"}')).toBeNull();
    expect(parseNpsso('{"npsso":null}')).toBeNull();
    expect(parseNpsso('{"npsso":""}')).toBeNull();
  });

  it("rejects malformed JSON rather than passing the braces through", () => {
    expect(parseNpsso('{"npsso":')).toBeNull();
  });
});
