/**
 * Questions people actually type, against a corpus shaped like the live site,
 * with the source each one must find. No model call: this pins retrieval and
 * prompt assembly, the parts that decide what the model gets to see. When a
 * real query comes back wrong, add it here before changing weights or terms.
 */
import { buildAskMessages, selectAskSources } from "./prompt";
import { rankDocuments, type SearchDocument } from "./ranking";

const NOW = new Date("2026-11-15T09:00:00.000Z");

function work(
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
  work(
    "healform",
    "Healform®",
    "2027-01-01 00:00",
    ["Full Stack", "iOS", "Client Work"],
    "Fullstack build, infra and product design for Healform®, a cryocenter for whole-body cold therapy and the first cryosauna in Kassel and Baunatal.",
  ),
  work(
    "innenstadt-id-100",
    "Innenstadt ID-100, Companion App",
    "2026-02-01 00:00",
    ["Full Stack", "Go", "Web", "Open Source", "Collaboration"],
    INNENSTADT_LEAD,
    `${INNENSTADT_LEAD} ${FILLER} ${LOGIN_DETAIL} ${FILLER}`,
  ),
  work(
    "were-yet-to-find-out",
    "we're yet to find out, the vague haze we're walking into",
    "2026-01-02 00:00",
    ["Photography", "Print"],
    "A photo series on film, printed as a small edition.",
  ),
  work(
    "sentiment",
    "SENTIMENT (project-sentiment.org)",
    "2025-04-10 00:00",
    ["Next.js", "Web", "Client Work", "Open Source"],
    "Web development for SENTIMENT, a research project on safe self-disclosure when people talk to chatbots and dialogue systems.",
  ),
  work(
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
