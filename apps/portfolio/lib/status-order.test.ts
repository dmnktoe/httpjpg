import { orderStatusLines } from "./status-order";

function line(key: string, date: string | null, isLive = false) {
  return { key, date, isLive };
}

describe("orderStatusLines", () => {
  it("puts live lines first, then the newest dated, then the undated", () => {
    const ordered = orderStatusLines([
      line("letterboxd", "2026-11-05"),
      line("reddit", null),
      line("discord", null, true),
      line("psn", "2026-11-14T22:42:29Z"),
      line("discogs", "2020-07-08T21:36:57-07:00"),
      line("lastfm", null, true),
    ]);

    expect(ordered.map((entry) => entry.key)).toEqual([
      "discord",
      "lastfm",
      "psn",
      "letterboxd",
      "discogs",
      "reddit",
    ]);
  });

  it("keeps the footer order between lines of the same rank and time", () => {
    const ordered = orderStatusLines([
      line("steam", null),
      line("x", "2026-11-20T10:00:00Z"),
      line("github", "2026-11-20T10:00:00Z"),
      line("reddit", null),
    ]);

    expect(ordered.map((entry) => entry.key)).toEqual(["x", "github", "steam", "reddit"]);
  });

  it("puts a match still to come above past events by its kickoff", () => {
    const ordered = orderStatusLines([
      line("letterboxd", "2026-11-24"),
      line("schalke", "2026-11-28T17:30:00Z"),
    ]);

    expect(ordered.map((entry) => entry.key)).toEqual(["schalke", "letterboxd"]);
  });

  it("treats an unparsable date as undated", () => {
    const ordered = orderStatusLines([line("a", "soon"), line("b", "2026-01-01")]);

    expect(ordered.map((entry) => entry.key)).toEqual(["b", "a"]);
  });
});
