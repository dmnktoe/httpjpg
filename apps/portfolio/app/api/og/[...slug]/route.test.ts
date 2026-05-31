// @vitest-environment node
import type * as Observability from "@httpjpg/observability/sentry/server.ts";
import type * as StoryblokNext from "@httpjpg/storyblok-next";

vi.mock("@httpjpg/storyblok-next", () => ({ fetchStory: vi.fn() }));
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));
vi.mock("@/lib/og-ascii", () => ({
  imageToAscii: vi.fn(async () => ({ text: "ascii", cols: 1, rows: 1 })),
}));
interface JsxNode {
  type?: unknown;
  props?: { children?: unknown };
}
// Force functional components to execute so coverage sees their branches.
function evaluateJsx(node: unknown): void {
  if (!node || typeof node !== "object") return;
  const n = node as JsxNode;
  if (typeof n.type === "function") {
    evaluateJsx((n.type as (p: unknown) => unknown)(n.props));
    return;
  }
  const children = n.props?.children;
  if (Array.isArray(children)) {
    children.forEach(evaluateJsx);
  } else if (children) {
    evaluateJsx(children);
  }
}

vi.mock("next/og", () => ({
  ImageResponse: vi.fn(function MockImageResponse(
    this: { ok: boolean; status: number },
    jsx: unknown,
  ) {
    evaluateJsx(jsx);
    this.ok = true;
    this.status = 200;
  }),
}));

const originalFetch = globalThis.fetch;
beforeAll(() => {
  globalThis.fetch = vi.fn(async () => {
    return {
      ok: true,
      status: 200,
      text: async () =>
        "@font-face { src: url(https://fonts.gstatic.com/s/x/v1/abc.ttf) format('truetype'); }",
      arrayBuffer: async () => new ArrayBuffer(8),
    } as Response;
  });
});
afterAll(() => {
  globalThis.fetch = originalFetch;
});

const { fetchStory } = (await import("@httpjpg/storyblok-next")) as typeof StoryblokNext;
const { captureServerException } =
  (await import("@httpjpg/observability/sentry/server.ts")) as typeof Observability;
const { GET } = await import("./route");

const mockedFetchStory = vi.mocked(fetchStory);
const mockedCapture = vi.mocked(captureServerException);

function callGET(slug: string[]) {
  return GET(new Request("https://example.com/api/og/" + slug.join("/")), {
    params: Promise.resolve({ slug }),
  });
}

function validWorkStory() {
  return {
    name: "P",
    content: {
      component: "work",
      title: "T",
      images: [{ filename: "//a.storyblok.com/f/1/cover.jpg" }],
    },
  } as never;
}

describe("GET /api/og/[...slug]", () => {
  beforeEach(() => {
    mockedFetchStory.mockReset();
    mockedCapture.mockReset();
  });

  // Font-error tests must run before any happy path so the module-level
  // fontsPromise cache stays empty.
  it("reports a 500 when the Google Fonts CSS fetch fails", async () => {
    mockedFetchStory.mockResolvedValueOnce(validWorkStory());
    const prev = globalThis.fetch;
    globalThis.fetch = vi.fn(async () => ({ ok: false, status: 503 }) as Response);
    const res = await callGET(["font-css-fail"]);
    globalThis.fetch = prev;
    expect(res.status).toBe(500);
    expect(mockedCapture).toHaveBeenCalledTimes(1);
  });

  it("reports a 500 when the CSS contains no TTF URL", async () => {
    mockedFetchStory.mockResolvedValueOnce(validWorkStory());
    const prev = globalThis.fetch;
    globalThis.fetch = vi.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          text: async () => "body { font-family: sans; }",
        }) as Response,
    );
    const res = await callGET(["font-no-ttf"]);
    globalThis.fetch = prev;
    expect(res.status).toBe(500);
  });

  it("reports a 500 when the font binary fetch fails", async () => {
    mockedFetchStory.mockResolvedValueOnce(validWorkStory());
    const prev = globalThis.fetch;
    let callCount = 0;
    globalThis.fetch = vi.fn(async () => {
      callCount++;
      if (callCount <= 5) {
        return {
          ok: true,
          status: 200,
          text: async () =>
            "@font-face { src: url(https://fonts.gstatic.com/s/x/v1/abc.ttf) format('truetype'); }",
        } as Response;
      }
      return { ok: false, status: 500 } as Response;
    });
    const res = await callGET(["font-bin-fail"]);
    globalThis.fetch = prev;
    expect(res.status).toBe(500);
  });

  it("returns 404 when no story is found", async () => {
    mockedFetchStory.mockResolvedValueOnce(null as never);
    const res = await callGET(["work", "missing"]);
    expect(res.status).toBe(404);
    expect(mockedFetchStory).toHaveBeenCalledWith("work/missing", { draftMode: false });
  });

  it("refuses to fetch images hosted off the Storyblok CDN", async () => {
    mockedFetchStory.mockResolvedValueOnce({
      content: {
        component: "work",
        images: [{ filename: "https://attacker.example/cover.jpg" }],
      },
    } as never);
    const res = await callGET(["work", "spoof"]);
    expect(res.status).toBe(422);
    expect(await res.text()).toBe("Image source not allowed");
  });

  it("forwards unexpected errors to Sentry and responds 500", async () => {
    mockedFetchStory.mockRejectedValueOnce(new Error("boom"));
    const res = await callGET(["work", "broken"]);
    expect(res.status).toBe(500);
    expect(mockedCapture).toHaveBeenCalledTimes(1);
    const [error, ctx] = mockedCapture.mock.calls[0]!;
    expect((error as Error).message).toBe("boom");
    expect(ctx).toMatchObject({ tags: { route: "og" }, extra: { slug: "work/broken" } });
  });

  it("renders the work layout for a published work story", async () => {
    mockedFetchStory.mockResolvedValueOnce({
      name: "Project",
      content: {
        component: "work",
        title: "Project Title",
        date: "2024-06-01",
        isDark: true,
        images: [{ filename: "//a.storyblok.com/f/1/cover.jpg" }],
      },
    } as never);
    const res = await callGET(["work", "my-project"]);
    expect(res.status).toBe(200);
    const { ImageResponse } = await import("next/og");
    expect(ImageResponse).toHaveBeenCalledTimes(1);
    const [, opts] = vi.mocked(ImageResponse).mock.calls[0]!;
    expect(opts).toMatchObject({ width: 1200, height: 630 });
  });

  it("renders the page layout for a non-work story with an image", async () => {
    mockedFetchStory.mockResolvedValueOnce({
      name: "CV",
      content: {
        component: "page",
        images: [{ filename: "//a.storyblok.com/f/1/cv.jpg" }],
      },
    } as never);
    const res = await callGET(["cv"]);
    expect(res.status).toBe(200);
  });

  it("renders the page layout without an image when none is set", async () => {
    mockedFetchStory.mockResolvedValueOnce({
      name: "About",
      content: { component: "page" },
    } as never);
    const res = await callGET(["about"]);
    expect(res.status).toBe(200);
  });

  it("falls back to the story name when title is missing", async () => {
    mockedFetchStory.mockResolvedValueOnce({
      name: "Fallback Name",
      content: {
        component: "work",
        images: [{ filename: "//a.storyblok.com/f/1/cover.jpg" }],
      },
    } as never);
    const res = await callGET(["work", "fallback"]);
    expect(res.status).toBe(200);
  });
});
