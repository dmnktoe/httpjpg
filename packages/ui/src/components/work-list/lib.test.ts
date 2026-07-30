import { applyTagFilter } from "./lib";

function buildList(cards: Array<string | null>): HTMLElement {
  const scope = document.createElement("div");
  cards.forEach((tags, index) => {
    const card = document.createElement("div");
    card.dataset.tags = tags ?? "";
    card.dataset.testid = `card-${index}`;
    scope.append(card);
    if (index < cards.length - 1) {
      const divider = document.createElement("hr");
      divider.setAttribute("data-work-divider", "");
      divider.dataset.testid = `divider-${index}`;
      scope.append(divider);
    }
  });
  return scope;
}

function visibility(scope: HTMLElement): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  scope.querySelectorAll<HTMLElement>("[data-testid]").forEach((node) => {
    state[node.dataset.testid as string] = node.style.display !== "none";
  });
  return state;
}

describe("applyTagFilter", () => {
  it("shows every card and divider when no tag is active", () => {
    const scope = buildList([",print,", ",web,", ",print,"]);
    applyTagFilter(scope, null);
    expect(visibility(scope)).toEqual({
      "card-0": true,
      "divider-0": true,
      "card-1": true,
      "divider-1": true,
      "card-2": true,
    });
  });

  it("hides cards without the active tag", () => {
    const scope = buildList([",print,", ",web,", ",print,"]);
    applyTagFilter(scope, "web");
    expect(visibility(scope)["card-0"]).toBe(false);
    expect(visibility(scope)["card-1"]).toBe(true);
    expect(visibility(scope)["card-2"]).toBe(false);
  });

  it("keeps exactly one divider between two surviving cards", () => {
    const scope = buildList([",print,", ",web,", ",print,"]);
    applyTagFilter(scope, "print");
    expect(visibility(scope)).toEqual({
      "card-0": true,
      "divider-0": true,
      "card-1": false,
      "divider-1": false,
      "card-2": true,
    });
  });

  it("drops the trailing divider when the last cards are filtered out", () => {
    const scope = buildList([",print,", ",web,"]);
    applyTagFilter(scope, "print");
    expect(visibility(scope)).toEqual({
      "card-0": true,
      "divider-0": false,
      "card-1": false,
    });
  });

  it("drops the leading divider when the first card is filtered out", () => {
    const scope = buildList([",web,", ",print,", ",print,"]);
    applyTagFilter(scope, "print");
    expect(visibility(scope)).toEqual({
      "card-0": false,
      "divider-0": false,
      "card-1": true,
      "divider-1": true,
      "card-2": true,
    });
  });

  it("hides every divider when a single card survives", () => {
    const scope = buildList([",print,", ",web,", ",web,"]);
    applyTagFilter(scope, "print");
    expect(visibility(scope)).toEqual({
      "card-0": true,
      "divider-0": false,
      "card-1": false,
      "divider-1": false,
      "card-2": false,
    });
  });

  it("restores visibility after clearing the filter", () => {
    const scope = buildList([",print,", ",web,"]);
    applyTagFilter(scope, "print");
    applyTagFilter(scope, null);
    expect(visibility(scope)).toEqual({
      "card-0": true,
      "divider-0": true,
      "card-1": true,
    });
  });
});
