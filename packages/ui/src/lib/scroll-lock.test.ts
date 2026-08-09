import { lockBodyScroll } from "./scroll-lock";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("lockBodyScroll", () => {
  it("freezes the body and restores it on release", () => {
    const release = lockBodyScroll();
    expect(document.body.style.overflow).toBe("hidden");

    release();

    expect(document.body.style.overflow).toBe("");
  });

  it("keeps the body frozen until the last holder releases", () => {
    const releaseMenu = lockBodyScroll();
    const releasePalette = lockBodyScroll();

    releaseMenu();
    expect(document.body.style.overflow).toBe("hidden");

    releasePalette();
    expect(document.body.style.overflow).toBe("");
  });

  it("ignores a second release from the same holder", () => {
    const releaseMenu = lockBodyScroll();
    const releasePalette = lockBodyScroll();

    releaseMenu();
    releaseMenu();

    expect(document.body.style.overflow).toBe("hidden");
    releasePalette();
    expect(document.body.style.overflow).toBe("");
  });

  it("restores whatever the page had set before the first lock", () => {
    document.body.style.overflow = "scroll";

    const release = lockBodyScroll();
    expect(document.body.style.overflow).toBe("hidden");

    release();

    expect(document.body.style.overflow).toBe("scroll");
  });
});
