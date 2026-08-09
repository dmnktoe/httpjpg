// @vitest-environment node
import { decodeEntities } from "./html";

describe("decodeEntities", () => {
  it("decodes the named entities", () => {
    expect(decodeEntities("Johnny &amp; Me")).toBe("Johnny & Me");
    expect(decodeEntities("&lt;b&gt;")).toBe("<b>");
    expect(decodeEntities("&quot;quoted&quot;")).toBe('"quoted"');
    expect(decodeEntities("a&nbsp;b")).toBe("a b");
  });

  it("decodes decimal and hex numeric entities", () => {
    expect(decodeEntities("Teachers&#039; Lounge")).toBe("Teachers' Lounge");
    expect(decodeEntities("&#x2764;")).toBe("❤");
  });

  it("leaves unknown entities untouched", () => {
    expect(decodeEntities("&unknown;")).toBe("&unknown;");
    expect(decodeEntities("&#xZZ;")).toBe("&#xZZ;");
  });

  it("leaves numeric entities outside the Unicode range alone", () => {
    expect(decodeEntities("&#1114112;")).toBe("&#1114112;");
    expect(decodeEntities("&#xFFFFFFFF;")).toBe("&#xFFFFFFFF;");
    expect(decodeEntities("&#x10FFFF;")).toBe(String.fromCodePoint(0x10ffff));
  });
});
