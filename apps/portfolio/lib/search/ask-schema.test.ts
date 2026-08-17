import { parseAskQuestion } from "./ask-schema";
import { MAX_QUESTION_LENGTH } from "./prompt";

describe("parseAskQuestion", () => {
  it("returns the trimmed question", () => {
    expect(parseAskQuestion({ question: "  hello  " })).toEqual({
      ok: true,
      question: "hello",
    });
  });

  it("rejects a missing or blank question", () => {
    expect(parseAskQuestion({})).toEqual({ ok: false, error: "missing_question" });
    expect(parseAskQuestion({ question: "   " })).toEqual({ ok: false, error: "missing_question" });
    expect(parseAskQuestion({ question: 42 })).toEqual({ ok: false, error: "missing_question" });
    expect(parseAskQuestion(null)).toEqual({ ok: false, error: "missing_question" });
  });

  it("rejects an oversized question", () => {
    expect(parseAskQuestion({ question: "x".repeat(MAX_QUESTION_LENGTH + 1) })).toEqual({
      ok: false,
      error: "question_too_long",
    });
  });
});
