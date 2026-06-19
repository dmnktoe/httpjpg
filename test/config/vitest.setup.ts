import "@testing-library/jest-dom/vitest";

process.env.SKIP_ENV_VALIDATION = "true";

// jsdom lacks IntersectionObserver, which several @httpjpg/ui components
// (Image, ScrollClipImage, animate-in-view) rely on. Provide a no-op stub so
// they can mount in tests. Individual tests may override it for assertions.
if (!("IntersectionObserver" in globalThis)) {
  class IntersectionObserverStub {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof globalThis.IntersectionObserver;
}

// jsdom lacks ResizeObserver, used by marquee/measurement components.
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof globalThis.ResizeObserver;
}

// jsdom lacks matchMedia, used by reduced-motion and responsive hooks. Default
// to a non-matching query; tests asserting on it can override per-file.
if (typeof globalThis.matchMedia !== "function") {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof globalThis.matchMedia;
}
