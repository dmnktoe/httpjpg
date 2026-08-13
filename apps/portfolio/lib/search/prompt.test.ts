import { buildAskMessages, MAX_QUESTION_LENGTH } from "./prompt";
import type { SearchDocument } from "./ranking";

const SOURCE: SearchDocument = {
  id: "1",
  href: "/work/demo",
  title: "Demo Project",
  kind: "work",
  tags: ["Projects", "Print"],
  excerpt: "A risograph poster series",
  date: "2026-01-01T10:00:00.000Z",
};

describe("buildAskMessages", () => {
  it("puts the grounding rules in a system message", () => {
    const [system] = buildAskMessages("what is demo?", [SOURCE]);

    expect(system.role).toBe("system");
    expect(system.content).toContain("Use only the SOURCES");
  });

  it("numbers each source so the model can cite it", () => {
    const second: SearchDocument = { ...SOURCE, id: "2", title: "Second" };

    const [, user] = buildAskMessages("q", [SOURCE, second]);

    expect(user.content).toContain("[1] Demo Project");
    expect(user.content).toContain("[2] Second");
  });

  it("includes the path, tags, date, and excerpt of a source", () => {
    const [, user] = buildAskMessages("q", [SOURCE]);

    expect(user.content).toContain("path: /work/demo");
    expect(user.content).toContain("tags: Projects, Print");
    expect(user.content).toContain("date: 2026-01-01");
    expect(user.content).toContain("A risograph poster series");
  });

  it("omits empty tag, date, and excerpt lines", () => {
    const bare: SearchDocument = { ...SOURCE, tags: [], excerpt: "", date: undefined };

    const [, user] = buildAskMessages("q", [bare]);

    expect(user.content).not.toContain("tags:");
    expect(user.content).not.toContain("date:");
  });

  it("says so explicitly when there are no sources", () => {
    const [, user] = buildAskMessages("q", []);

    expect(user.content).toContain("(no matching content)");
  });

  it("appends the question", () => {
    const [, user] = buildAskMessages("what is demo?", [SOURCE]);

    expect(user.content).toContain("QUESTION: what is demo?");
  });

  it("truncates an oversized question", () => {
    const [, user] = buildAskMessages("x".repeat(MAX_QUESTION_LENGTH + 200), [SOURCE]);

    expect(user.content).toContain("x".repeat(MAX_QUESTION_LENGTH));
    expect(user.content).not.toContain("x".repeat(MAX_QUESTION_LENGTH + 1));
  });

  it("caps a very long excerpt", () => {
    const long: SearchDocument = { ...SOURCE, excerpt: "y".repeat(900) };

    const [, user] = buildAskMessages("q", [long]);

    expect(user.content).toContain("y".repeat(600));
    expect(user.content).not.toContain("y".repeat(601));
  });
});

describe("buildAskMessages · drafts", () => {
  it("labels an unpublished source so the model can flag it", () => {
    const [, user] = buildAskMessages("what is new?", [
      {
        id: "1",
        href: "/work/wip",
        title: "Work In Progress",
        kind: "work",
        tags: [],
        tagValues: [],
        excerpt: "",
        isDraft: true,
      },
    ]);

    expect(user.content).toContain("status: draft");
  });

  it("says nothing about status for a published source", () => {
    const [, user] = buildAskMessages("what is new?", [
      {
        id: "1",
        href: "/work/live",
        title: "Live",
        kind: "work",
        tags: [],
        tagValues: [],
        excerpt: "",
      },
    ]);

    expect(user.content).not.toContain("status: draft");
  });
});
