import { draftActions, EXIT_DRAFT_HREF, workPreviewAction } from "./lib";

const EDIT = "https://app.storyblok.com/#/me/spaces/7/stories/0/0/9";

function labels(options: Parameters<typeof draftActions>[0]): string[] {
  return draftActions(options).map((action) => action.label);
}

describe("workPreviewAction", () => {
  it("is an accented external link with the kawaii desktop label", () => {
    const action = workPreviewAction("https://external.dev");
    expect(action).toMatchObject({ href: "https://external.dev", glyph: "↗", accented: true });
    expect(action.ariaLabel).toBe("preview — open external preview");
    expect(action.label).toContain("(っ◔◡◔)っ ♥ preview");
  });

  it("takes a custom label", () => {
    expect(workPreviewAction("https://external.dev", "demo").ariaLabel).toBe(
      "demo — open external preview",
    );
  });
});

describe("draftActions", () => {
  const onToggleGrid = vi.fn();

  it("is draft · exit · grid without an edit link", () => {
    expect(labels({ gridOpen: false, onToggleGrid })).toEqual(["draft", "exit", "grid"]);
  });

  it("adds edit when the page carries a Visual Editor link", () => {
    const actions = draftActions({ editHref: EDIT, gridOpen: false, onToggleGrid });
    expect(actions.map((action) => action.label)).toEqual(["draft", "edit", "exit", "grid"]);
    expect(actions[1]?.href).toBe(EDIT);
    expect(actions[2]).toMatchObject({ href: EXIT_DRAFT_HREF, external: false });
  });

  it("drops edit and exit inside the Visual Editor", () => {
    expect(labels({ editHref: EDIT, inEditor: true, gridOpen: false, onToggleGrid })).toEqual([
      "draft",
      "grid",
    ]);
  });

  it("never accents draft tools and keeps the grid name stable", () => {
    const closed = draftActions({ gridOpen: false, onToggleGrid });
    const open = draftActions({ gridOpen: true, onToggleGrid });
    expect(closed.some((action) => action.accented)).toBe(false);
    expect(closed.at(-1)).toMatchObject({ pressed: false, onClick: onToggleGrid });
    expect(open.at(-1)).toMatchObject({ pressed: true });
    expect(open.at(-1)?.ariaLabel).toBe(closed.at(-1)?.ariaLabel);
  });
});
