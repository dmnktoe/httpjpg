// @vitest-environment node
import { decodeEntities, stripHtml } from "./html";

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
});

describe("stripHtml", () => {
  it("turns block markup into single spaces", () => {
    expect(stripHtml("<p>First</p><p>Second</p>")).toBe("First Second");
    expect(stripHtml("one<br>two<br/>three")).toBe("one two three");
    expect(stripHtml("<ul><li>a</li><li>b</li></ul>")).toBe("a b");
  });

  it("drops inline markup but keeps its text", () => {
    expect(stripHtml('<p>hello <a href="https://example.test">world</a></p>')).toBe("hello world");
  });

  it("decodes entities after removing the tags", () => {
    expect(stripHtml("<p>Tom &amp; Jerry</p>")).toBe("Tom & Jerry");
    expect(stripHtml("<p>&lt;script&gt;</p>")).toBe("<script>");
  });

  it("collapses whitespace and trims", () => {
    expect(stripHtml("<p>  spaced   out  </p>")).toBe("spaced out");
    expect(stripHtml("")).toBe("");
  });
});
