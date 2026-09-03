import { editHrefFromEditable } from "./editor-chrome";

describe("editHrefFromEditable", () => {
  it("returns null without an _editable comment", () => {
    expect(editHrefFromEditable()).toBeNull();
    expect(editHrefFromEditable(undefined)).toBeNull();
  });

  it("builds the Visual Editor href from the draft comment", () => {
    expect(editHrefFromEditable('<!--#storyblok#{"space":"7","id":"9"}-->')).toBe(
      "https://app.storyblok.com/#/me/spaces/7/stories/0/0/9",
    );
  });
});
