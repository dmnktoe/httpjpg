import { cleanAnswerText, createAnswerCleaner } from "./answer-cleaner";

describe("cleanAnswerText", () => {
  it("turns full-width citations into ASCII ones", () => {
    expect(cleanAnswerText("Released in 2026 【2】.")).toBe("Released in 2026 [2].");
    expect(cleanAnswerText("Built in Go ［1］.")).toBe("Built in Go [1].");
  });

  it("drops gpt-oss location noise after the number", () => {
    expect(cleanAnswerText("It uses Go 【3†L4-L9】.")).toBe("It uses Go [3].");
  });

  it("splits a full-width list into one citation per source", () => {
    expect(cleanAnswerText("Both 【1, 3】 and 【2、4】.")).toBe("Both [1][3] and [2][4].");
  });

  it("strips markdown bold", () => {
    expect(cleanAnswerText("The latest is **Innenstadt ID-100** [2].")).toBe(
      "The latest is Innenstadt ID-100 [2].",
    );
  });

  it("leaves ASCII citations and plain text alone", () => {
    expect(cleanAnswerText("It is a portfolio [1][3].")).toBe("It is a portfolio [1][3].");
  });

  it("leaves a full-width bracket without a number alone", () => {
    expect(cleanAnswerText("【note】")).toBe("【note】");
  });
});

describe("createAnswerCleaner", () => {
  function run(chunks: string[]): string[] {
    const cleaner = createAnswerCleaner();
    const out = chunks.map((chunk) => cleaner.push(chunk));
    out.push(cleaner.flush());
    return out;
  }

  it("holds a citation split across deltas until it closes", () => {
    const out = run(["Released ", "【", "2", "】", "."]);

    expect(out).toEqual(["Released ", "", "", "[2]", ".", ""]);
  });

  it("holds a bold marker split across deltas", () => {
    expect(run(["The **Inn", "enstadt*", "* app"]).join("")).toBe("The Innenstadt app");
    expect(run(["a *", "*b**", " c"]).join("")).toBe("a b c");
  });

  it("releases an opening bracket that never closes", () => {
    const out = run(["【", "x".repeat(60)]);

    expect(out.join("")).toBe(`【${"x".repeat(60)}`);
    expect(out[1]).not.toBe("");
  });

  it("flushes whatever is held when the stream ends", () => {
    expect(run(["half 【2"])).toEqual(["half ", "【2"]);
  });
});
