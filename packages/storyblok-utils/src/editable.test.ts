import {
  parseStoryblokEditable,
  storyblokEditorHref,
  storyblokEditorHrefFromEditable,
} from "./editable";

const RAW = '<!--#storyblok#{"name": "work", "space": "12345", "uid": "abc-123", "id": "67890"}-->';

describe("parseStoryblokEditable", () => {
  it("reads space and story id from the comment payload", () => {
    expect(parseStoryblokEditable(RAW)).toEqual({
      name: "work",
      space: "12345",
      uid: "abc-123",
      id: "67890",
    });
  });

  it("coerces numeric ids to strings", () => {
    expect(parseStoryblokEditable('<!--#storyblok#{"space": 1, "id": 2}-->')).toEqual({
      name: undefined,
      space: "1",
      uid: undefined,
      id: "2",
    });
  });

  it("returns null for missing or malformed comments", () => {
    expect(parseStoryblokEditable()).toBeNull();
    expect(parseStoryblokEditable("")).toBeNull();
    expect(parseStoryblokEditable("<!--#storyblok#not-json-->")).toBeNull();
    expect(parseStoryblokEditable('<!--#storyblok#{"space":"1"}-->')).toBeNull();
  });
});

describe("storyblokEditorHref", () => {
  it("builds the Visual Editor deep-link", () => {
    expect(storyblokEditorHref("12345", "67890")).toBe(
      "https://app.storyblok.com/#/me/spaces/12345/stories/0/0/67890",
    );
  });

  it("returns null when the comment cannot be parsed", () => {
    expect(storyblokEditorHrefFromEditable(undefined)).toBeNull();
    expect(storyblokEditorHrefFromEditable(RAW)).toBe(
      "https://app.storyblok.com/#/me/spaces/12345/stories/0/0/67890",
    );
  });
});
