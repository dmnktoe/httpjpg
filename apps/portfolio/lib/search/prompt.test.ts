import { buildAskMessages, MAX_QUESTION_LENGTH, selectAskSources } from "./prompt";
import { rankDocuments, type SearchDocument } from "./ranking";

const SOURCE: SearchDocument = {
  id: "1",
  href: "/work/demo",
  title: "Demo Project",
  kind: "work",
  tags: ["Projects", "Print"],
  excerpt: "A risograph poster series",
  date: "2026-01-01T10:00:00.000Z",
};

const NOW = new Date("2026-11-15T09:00:00.000Z");

function ranked(...sources: SearchDocument[]) {
  return { ranked: sources, catalog: [] };
}

describe("buildAskMessages", () => {
  it("puts the grounding rules in a system message", () => {
    const [system] = buildAskMessages("what is demo?", ranked(SOURCE), NOW);

    expect(system.role).toBe("system");
    expect(system.content).toContain("Use only the SOURCES");
  });

  it("tells the model today's date and what a later date means", () => {
    const [system] = buildAskMessages("q", ranked(SOURCE), NOW);

    expect(system.content).toContain("Today is 2026-11-15.");
    expect(system.content).toContain("upcoming work that is not released yet");
  });

  it("asks for plain text and ASCII citations", () => {
    const [system] = buildAskMessages("q", ranked(SOURCE), NOW);

    expect(system.content).toContain("no markdown");
    expect(system.content).toContain("plain ASCII square brackets");
  });

  it("numbers each source so the model can cite it", () => {
    const second: SearchDocument = { ...SOURCE, id: "2", title: "Second" };

    const [, user] = buildAskMessages("q", ranked(SOURCE, second), NOW);

    expect(user.content).toContain("[1] Demo Project");
    expect(user.content).toContain("[2] Second");
  });

  it("includes the path, tags, date, and excerpt of a source", () => {
    const [, user] = buildAskMessages("q", ranked(SOURCE), NOW);

    expect(user.content).toContain("path: /work/demo");
    expect(user.content).toContain("tags: Projects, Print");
    expect(user.content).toContain("date: 2026-01-01");
    expect(user.content).toContain("A risograph poster series");
  });

  it("marks a date after today as upcoming", () => {
    const upcoming: SearchDocument = { ...SOURCE, date: "2027-01-01 00:00" };

    const [, user] = buildAskMessages("q", ranked(upcoming), NOW);

    expect(user.content).toContain("date: 2027-01-01 (upcoming, not released yet)");
  });

  it("omits empty tag, date, and excerpt lines", () => {
    const bare: SearchDocument = { ...SOURCE, tags: [], excerpt: "", date: undefined };

    const [, user] = buildAskMessages("q", ranked(bare), NOW);

    expect(user.content).not.toContain("tags:");
    expect(user.content).not.toContain("date:");
  });

  it("says so explicitly when there are no sources", () => {
    const [, user] = buildAskMessages("q", ranked(), NOW);

    expect(user.content).toContain("(no matching content)");
  });

  it("appends the question", () => {
    const [, user] = buildAskMessages("what is demo?", ranked(SOURCE), NOW);

    expect(user.content).toContain("QUESTION: what is demo?");
  });

  it("truncates an oversized question", () => {
    const [, user] = buildAskMessages("x".repeat(MAX_QUESTION_LENGTH + 200), ranked(SOURCE), NOW);

    expect(user.content).toContain("x".repeat(MAX_QUESTION_LENGTH));
    expect(user.content).not.toContain("x".repeat(MAX_QUESTION_LENGTH + 1));
  });

  it("caps a very long excerpt", () => {
    const long: SearchDocument = { ...SOURCE, excerpt: "y".repeat(900) };

    const [, user] = buildAskMessages("q", ranked(long), NOW);

    expect(user.content).toContain("y".repeat(700));
    expect(user.content).not.toContain("y".repeat(701));
  });

  it("quotes the passage of the body that matches the question", () => {
    const filler = Array.from({ length: 20 }, (_, index) => `Filler sentence ${index}.`).join(" ");
    const long: SearchDocument = {
      ...SOURCE,
      body: `${filler} Access is sewn into a bag with a QR code. ${filler}`,
    };

    const [, user] = buildAskMessages("how does the qr code login work?", ranked(long), NOW);

    expect(user.content).toContain("Access is sewn into a bag with a QR code.");
  });

  it("lists the catalog after the ranked sources, continuing their numbering", () => {
    const listed: SearchDocument = {
      ...SOURCE,
      id: "2",
      title: "Healform",
      href: "/work/healform",
      tags: ["Full Stack"],
      excerpt: "A cryocenter platform",
      date: "2027-01-01 00:00",
    };

    const [, user] = buildAskMessages("q", { ranked: [SOURCE], catalog: [listed] }, NOW);

    expect(user.content).toContain("More work on the site, newest first:");
    expect(user.content).toContain(
      "[2] Healform | /work/healform | 2027-01-01 (upcoming, not released yet) | tags: Full Stack | A cryocenter platform",
    );
    expect(user.content.indexOf("[1] Demo Project")).toBeLessThan(
      user.content.indexOf("[2] Healform"),
    );
  });

  it("shortens a catalog summary at a word boundary", () => {
    const listed: SearchDocument = { ...SOURCE, id: "2", excerpt: "word ".repeat(80), tags: [] };

    const [, user] = buildAskMessages("q", { ranked: [], catalog: [listed] }, NOW);
    const line = user.content.split("\n").find((entry) => entry.startsWith("[1]")) ?? "";

    expect(line).toMatch(/word…$/);
    expect(line.length).toBeLessThan(220);
  });
});

describe("selectAskSources", () => {
  const work = (id: string, title: string, date?: string, excerpt = ""): SearchDocument => ({
    id,
    href: `/work/${id}`,
    title,
    kind: "work",
    tags: [],
    excerpt,
    date,
  });

  const DOCUMENTS: SearchDocument[] = [
    work("old", "Radio Archive", "2019-06-19", "a radio show"),
    work("upcoming", "Healform", "2027-01-01", "a cryocenter"),
    work("mid", "Sentiment", "2025-04-10", "a research project"),
    { ...work("about", "About"), kind: "page", href: "/about" },
  ];

  it("ranks the matches and lists the rest of the work, newest first", () => {
    const { ranked: matches, catalog } = selectAskSources(DOCUMENTS, "radio");

    expect(matches.map((document) => document.id)).toEqual(["old"]);
    expect(catalog.map((document) => document.id)).toEqual(["upcoming", "mid"]);
  });

  it("keeps pages out of the catalog", () => {
    const { catalog } = selectAskSources(DOCUMENTS, "nothing matches this");

    expect(catalog.map((document) => document.kind)).not.toContain("page");
  });

  it("answers a recency question with the newest work first", () => {
    const { ranked: matches } = selectAskSources(DOCUMENTS, "what is the latest project?");

    expect(matches.map((document) => document.id)).toEqual(["upcoming", "mid", "old"]);
  });
});

function siteWork(
  slug: string,
  title: string,
  date: string,
  tags: string[],
  excerpt: string,
  body?: string,
): SearchDocument {
  return {
    id: slug,
    href: `/work/${slug}`,
    title,
    kind: "work",
    tags,
    tagValues: tags.map((tag) => tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
    excerpt,
    ...(body ? { body } : {}),
    date,
  };
}

const LOGIN_DETAIL =
  "There are no accounts. Access is sewn into a bag. Five bags exist, each with a QR code stitched into the fabric, and scanning it is the entire login.";

const INNENSTADT_LEAD =
  "INNENSTADT ID -100 — Companion App Participatory web application, 2025–2026 Go / Echo, PostgreSQL, MinIO, Meilisearch, TypeScript, Docker. Concept: Patrick Dücker, a non-commercial bachelor project at Universität Kassel. Participants get exercises to do on foot and bring back photos from the city.";

const FILLER = Array.from(
  { length: 20 },
  (_, index) => `The archive grows with every walk, entry ${index}.`,
).join(" ");

const CORPUS: SearchDocument[] = [
  siteWork(
    "healform",
    "Healform®",
    "2027-01-01 00:00",
    ["Full Stack", "iOS", "Client Work"],
    "Fullstack build, infra and product design for Healform®, a cryocenter for whole-body cold therapy and the first cryosauna in Kassel and Baunatal.",
  ),
  siteWork(
    "innenstadt-id-100",
    "Innenstadt ID-100, Companion App",
    "2026-02-01 00:00",
    ["Full Stack", "Go", "Web", "Open Source", "Collaboration"],
    INNENSTADT_LEAD,
    `${INNENSTADT_LEAD} ${FILLER} ${LOGIN_DETAIL} ${FILLER}`,
  ),
  siteWork(
    "were-yet-to-find-out",
    "we're yet to find out, the vague haze we're walking into",
    "2026-01-02 00:00",
    ["Photography", "Print"],
    "A photo series on film, printed as a small edition.",
  ),
  siteWork(
    "sentiment",
    "SENTIMENT (project-sentiment.org)",
    "2025-04-10 00:00",
    ["Next.js", "Web", "Client Work", "Open Source"],
    "Web development for SENTIMENT, a research project on safe self-disclosure when people talk to chatbots and dialogue systems.",
  ),
  siteWork(
    "radio-rasclat",
    "Four Years of Transmission, Radio Rasclat",
    "2019-06-19 00:00",
    ["Music", "Web"],
    "A web radio and archive of mixes, exploring .wav files on digital grassland.",
  ),
  {
    id: "about",
    href: "/about",
    title: "About",
    kind: "page",
    tags: [],
    excerpt: "Domenik Töfflinger, designer and developer in Kassel.",
  },
];

const SEARCH_CASES: Array<{ query: string; first: string }> = [
  { query: "innenstadt", first: "/work/innenstadt-id-100" },
  { query: "innenstdat", first: "/work/innenstadt-id-100" },
  { query: "healfrom", first: "/work/healform" },
  { query: "sentiment", first: "/work/sentiment" },
  { query: "chatbots research", first: "/work/sentiment" },
  { query: "go projects", first: "/work/innenstadt-id-100" },
  { query: "qr code login", first: "/work/innenstadt-id-100" },
  { query: "fotos", first: "/work/were-yet-to-find-out" },
  { query: "musik", first: "/work/radio-rasclat" },
  { query: "latest project", first: "/work/healform" },
  { query: "neueste Arbeit", first: "/work/healform" },
  { query: "about", first: "/about" },
];

describe("search eval", () => {
  it.each(SEARCH_CASES)("'$query' finds $first first", ({ query, first }) => {
    expect(rankDocuments(CORPUS, query)[0]?.href).toBe(first);
  });

  it("lists every dated work for a bare recency query, newest first", () => {
    expect(rankDocuments(CORPUS, "latest").map((result) => result.href)).toEqual([
      "/work/healform",
      "/work/innenstadt-id-100",
      "/work/were-yet-to-find-out",
      "/work/sentiment",
      "/work/radio-rasclat",
    ]);
  });
});

describe("ask eval", () => {
  function prompt(question: string): { content: string; sourceCount: number } {
    const sources = selectAskSources(CORPUS, question);
    const [, user] = buildAskMessages(question, sources, NOW);
    return { content: user.content, sourceCount: sources.ranked.length + sources.catalog.length };
  }

  it("shows the model the upcoming work as upcoming for 'latest project'", () => {
    const { content } = prompt("what is the latest project?");

    expect(content).toContain(
      "[1] Healform®\npath: /work/healform\ntags: Full Stack, iOS, Client Work\ndate: 2027-01-01 (upcoming, not released yet)",
    );
    expect(content).toContain("[2] Innenstadt ID-100, Companion App");
    expect(content).toMatch(/\[2\][^[]*date: 2026-02-01\n/);
  });

  it("quotes the login detail from deep in the story", () => {
    const { content } = prompt("how does the login on innenstadt work?");

    expect(content).toContain("QR code stitched into the fabric");
  });

  it("gives a counting question every work to count", () => {
    const { content, sourceCount } = prompt("how many go projects are there?");

    expect(sourceCount).toBe(5);
    for (const document of CORPUS.filter((entry) => entry.kind === "work")) {
      expect(content).toContain(document.title);
    }
  });

  it("can answer a question with no word in common with the site", () => {
    const { content, sourceCount } = prompt("what did you make in 2019?");

    expect(sourceCount).toBe(5);
    expect(content).toContain("Radio Rasclat | /work/radio-rasclat | 2019-06-19");
  });
});
