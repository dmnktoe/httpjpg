import { draftEditorChrome } from "./editor-chrome";

describe("draftEditorChrome", () => {
  it("returns no chrome without an _editable comment", () => {
    expect(draftEditorChrome()).toEqual({
      editHref: null,
      gridToggle: false,
      actions: undefined,
    });
  });

  it("builds edit + exit actions from the draft comment", () => {
    const chrome = draftEditorChrome('<!--#storyblok#{"space":"7","id":"9"}-->');
    expect(chrome.editHref).toBe("https://app.storyblok.com/#/me/spaces/7/stories/0/0/9");
    expect(chrome.gridToggle).toBe(true);
    expect(chrome.actions).toEqual([
      {
        href: "https://app.storyblok.com/#/me/spaces/7/stories/0/0/9",
        label: "edit",
        glyph: "✎",
        ariaLabel: "Edit in Storyblok",
      },
      {
        href: "/api/exit-draft",
        label: "exit",
        glyph: "×",
        ariaLabel: "Exit draft preview",
        external: false,
        hideInIframe: true,
      },
    ]);
  });
});
