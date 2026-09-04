import {
  clampDesktopIconPoint,
  DESKTOP_ICON_MARGIN,
  desktopIconPositions,
  downloadFilename,
  extensionOf,
  fileKindFromSource,
  hashSeed,
  triggerDownload,
  visibleDesktopDownloads,
} from "./lib";

describe("extensionOf", () => {
  it("reads an extension from a filename", () => {
    expect(extensionOf("Press kit.PDF")).toBe("pdf");
    expect(extensionOf("archive.tar.gz")).toBe("gz");
  });

  it("reads an extension from a URL, ignoring query and hash", () => {
    expect(extensionOf("https://cdn.example/files/reel.mp4?dl=1#top")).toBe("mp4");
  });

  it("returns null when there is no extension", () => {
    expect(extensionOf("")).toBeNull();
    expect(extensionOf("Press kit")).toBeNull();
    expect(extensionOf("https://cdn.example/files/presskit")).toBeNull();
    expect(extensionOf(".gitignore")).toBeNull();
  });
});

describe("fileKindFromSource", () => {
  it("prefers the name extension over the URL", () => {
    expect(fileKindFromSource("notes.pdf", "https://cdn.example/notes.docx")).toBe("pdf");
  });

  it("falls back to the URL when the name has no extension", () => {
    expect(fileKindFromSource("Press kit", "https://cdn.example/kit.zip")).toBe("zip");
  });

  it("maps common extensions onto kinds", () => {
    expect(fileKindFromSource("a.png", "")).toBe("image");
    expect(fileKindFromSource("a.webm", "")).toBe("video");
    expect(fileKindFromSource("a.mp3", "")).toBe("audio");
    expect(fileKindFromSource("a.docx", "")).toBe("document");
    expect(fileKindFromSource("a.7z", "")).toBe("zip");
  });

  it("uses the generic file kind when nothing matches", () => {
    expect(fileKindFromSource("mystery", "https://cdn.example/blob")).toBe("file");
  });
});

describe("downloadFilename", () => {
  it("keeps a name that already has an extension", () => {
    expect(downloadFilename("Press kit.pdf", "https://cdn.example/x.zip")).toBe("Press kit.pdf");
  });

  it("appends the URL extension when the label is bare", () => {
    expect(downloadFilename("Press kit", "https://cdn.example/x.zip")).toBe("Press kit.zip");
  });

  it("falls back to download when both are nameless", () => {
    expect(downloadFilename("   ", "https://cdn.example/dir/")).toBe("download");
  });
});

describe("visibleDesktopDownloads", () => {
  it("drops blank names, blank urls, and unsafe schemes", () => {
    expect(
      visibleDesktopDownloads([
        { id: "1", name: "Keep", url: "https://cdn.example/a.pdf" },
        { id: "2", name: "  ", url: "https://cdn.example/a.pdf" },
        { id: "3", name: "Nope", url: "" },
        { id: "4", name: "XSS", url: "javascript:alert(1)" },
      ]),
    ).toEqual([{ id: "1", name: "Keep", url: "https://cdn.example/a.pdf" }]);
  });
});

describe("desktopIconPositions", () => {
  it("is deterministic for the same ids", () => {
    const ids = ["uid-a", "uid-b", "uid-c"];
    expect(desktopIconPositions(ids)).toEqual(desktopIconPositions(ids));
  });

  it("returns one point per id inside the padded viewport", () => {
    const positions = desktopIconPositions(["a", "b"]);
    expect(positions).toHaveLength(2);
    for (const position of positions) {
      expect(position.left).toBeGreaterThanOrEqual(6);
      expect(position.left).toBeLessThanOrEqual(94);
      expect(position.top).toBeGreaterThanOrEqual(12);
      expect(position.top).toBeLessThanOrEqual(88);
    }
  });

  it("returns an empty list for no ids", () => {
    expect(desktopIconPositions([])).toEqual([]);
  });
});

describe("hashSeed", () => {
  it("is stable and sensitive to input", () => {
    expect(hashSeed("abc")).toBe(hashSeed("abc"));
    expect(hashSeed("abc")).not.toBe(hashSeed("abd"));
  });
});

describe("clampDesktopIconPoint", () => {
  it("keeps a point inside the viewport margins", () => {
    expect(clampDesktopIconPoint(-40, -10, 800, 600)).toEqual({
      x: DESKTOP_ICON_MARGIN,
      y: DESKTOP_ICON_MARGIN,
    });
    expect(clampDesktopIconPoint(900, 700, 800, 600).x).toBeLessThan(800);
    expect(clampDesktopIconPoint(900, 700, 800, 600).y).toBeLessThan(600);
  });
});

describe("triggerDownload", () => {
  it("clicks a temporary anchor with download attrs", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    expect(triggerDownload("https://cdn.example/a.pdf", "Press kit")).toBe(true);

    const anchor = click.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.href).toBe("https://cdn.example/a.pdf");
    expect(anchor.download).toBe("Press kit.pdf");
    expect(anchor.target).toBe("_blank");
    expect(anchor.rel).toBe("noopener noreferrer");
    expect(document.body.contains(anchor)).toBe(false);

    click.mockRestore();
  });

  it("refuses javascript urls", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    expect(triggerDownload("javascript:alert(1)", "Nope")).toBe(false);
    expect(click).not.toHaveBeenCalled();

    click.mockRestore();
  });
});
