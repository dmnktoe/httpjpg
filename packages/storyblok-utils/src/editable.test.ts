import { storyblokEditHref } from "./editable";

const RAW = '<!--#storyblok#{"name": "work", "space": "12345", "uid": "abc-123", "id": "67890"}-->';

describe("storyblokEditHref", () => {
  it("builds the Visual Editor deep-link from the space and story id", () => {
    expect(storyblokEditHref(RAW)).toBe(
      "https://app.storyblok.com/#/me/spaces/12345/stories/0/0/67890",
    );
  });

  it("accepts numeric ids", () => {
    expect(storyblokEditHref('<!--#storyblok#{"space": 1, "id": 2}-->')).toBe(
      "https://app.storyblok.com/#/me/spaces/1/stories/0/0/2",
    );
  });

  it("returns null for published content (no comment)", () => {
    expect(storyblokEditHref(undefined)).toBeNull();
    expect(storyblokEditHref("")).toBeNull();
    expect(storyblokEditHref(42)).toBeNull();
  });

  it("returns null for malformed or incomplete comments", () => {
    expect(storyblokEditHref("<!--#storyblok#not-json-->")).toBeNull();
    expect(storyblokEditHref("<!--#storyblok#{not json}-->")).toBeNull();
    expect(storyblokEditHref('<!--#storyblok#{"space":"1"}-->')).toBeNull();
  });

  it("rejects ids that are not numeric", () => {
    expect(storyblokEditHref('<!--#storyblok#{"space":"1/../x","id":"2"}-->')).toBeNull();
    expect(storyblokEditHref('<!--#storyblok#{"space":"1","id":"2?evil"}-->')).toBeNull();
  });
});
