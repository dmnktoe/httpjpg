import { selectPassages } from "./passages";

const LEAD = "Innenstadt ID-100, a participatory web application, 2025–2026.";
const FILLER = Array.from({ length: 30 }, (_, index) => `Filler sentence number ${index}.`);

function story(...middle: string[]): string {
  return [LEAD, ...FILLER.slice(0, 15), ...middle, ...FILLER.slice(15)].join(" ");
}

describe("selectPassages", () => {
  it("returns short text whole", () => {
    expect(selectPassages("A short story.", ["login"], 700)).toBe("A short story.");
  });

  it("keeps the lead and adds the sentence matching the question", () => {
    const text = story("Access is sewn into a bag with a QR code.");

    const passage = selectPassages(text, ["qr", "code"], 200);

    expect(passage.startsWith(LEAD)).toBe(true);
    expect(passage).toContain("Access is sewn into a bag with a QR code.");
    expect(passage).toContain(" … ");
    expect(passage.length).toBeLessThanOrEqual(200);
  });

  it("prefers the sentence matching more terms", () => {
    const text = story("The login uses a cookie.", "The login uses a signed session cookie.");

    const passage = selectPassages(text, ["login", "signed", "session"], 120);

    expect(passage).toContain("signed session cookie");
    expect(passage).not.toContain("The login uses a cookie.");
  });

  it("matches synonyms and plurals of the terms", () => {
    const text = story("Every Projekt ships with photos.");

    expect(selectPassages(text, ["project"], 150)).toContain("Every Projekt ships");
  });

  it("keeps quoting the opening when nothing matches", () => {
    const text = story();

    const passage = selectPassages(text, ["nothing"], 200);

    expect(passage.startsWith(`${LEAD} Filler sentence number 0.`)).toBe(true);
    expect(passage.length).toBeLessThanOrEqual(200);
  });

  it("cuts a single overlong sentence to the budget", () => {
    const text = `${"word ".repeat(300).trim()}.`;

    const passage = selectPassages(text, [], 100);

    expect(passage.endsWith("…")).toBe(true);
    expect(passage.length).toBeLessThanOrEqual(101);
  });
});
