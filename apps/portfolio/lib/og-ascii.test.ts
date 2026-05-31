import sharp from "sharp";

import { imageToAscii, pixelsToAsciiGrid } from "./og-ascii";

vi.mock("sharp", () => ({ default: vi.fn() }));

describe("pixelsToAsciiGrid", () => {
  it("maps the brightness ramp endpoints to space and `@`", () => {
    const grid = pixelsToAsciiGrid([0, 255], 2, 1);
    expect(grid[0]).toBe(" ");
    expect(grid[1]).toBe("@");
  });

  it("emits one line per row, joined with `\\n`", () => {
    const grid = pixelsToAsciiGrid([0, 0, 255, 255], 2, 2);
    const lines = grid.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveLength(2);
    expect(lines[1]).toHaveLength(2);
  });

  it("walks the buffer in row-major order", () => {
    const grid = pixelsToAsciiGrid([0, 0, 0, 255, 255, 255], 3, 2);
    const [first, second] = grid.split("\n");
    expect(first).toBe("   ");
    expect(second).toBe("@@@");
  });

  it("steps through every ramp character", () => {
    const samples = Array.from({ length: 10 }, (_, i) => Math.floor((i * 255) / 9));
    const grid = pixelsToAsciiGrid(samples, 10, 1);
    expect(new Set(grid).size).toBeGreaterThan(5);
    expect(grid[0]).toBe(" ");
    expect(grid[grid.length - 1]).toBe("@");
  });

  it("treats out-of-bounds reads as fully dark", () => {
    const grid = pixelsToAsciiGrid([255], 2, 1);
    expect(grid).toBe("@ ");
  });
});

describe("imageToAscii", () => {
  const mockedSharp = vi.mocked(sharp);
  const originalFetch = globalThis.fetch;

  function mockSharpChain(pixels: number[], width: number, height: number) {
    const chain = {
      resize: vi.fn(() => chain),
      grayscale: vi.fn(() => chain),
      normalise: vi.fn(() => chain),
      raw: vi.fn(() => chain),
      toBuffer: vi.fn(async () => ({
        data: Buffer.from(pixels),
        info: { width, height },
      })),
    };
    mockedSharp.mockReturnValue(chain as unknown as ReturnType<typeof sharp>);
    return chain;
  }

  function mockFetch(ok = true) {
    globalThis.fetch = vi.fn(async () => {
      return {
        ok,
        status: ok ? 200 : 500,
        arrayBuffer: async () => new ArrayBuffer(8),
      } as Response;
    });
  }

  afterEach(() => {
    globalThis.fetch = originalFetch;
    mockedSharp.mockReset();
  });

  it("downsamples through sharp and returns the ASCII grid", async () => {
    mockFetch();
    const chain = mockSharpChain([0, 255, 255, 0], 2, 2);
    const result = await imageToAscii("https://a.storyblok.com/x.jpg", 2, 2);
    expect(chain.resize).toHaveBeenCalledWith(2, 2, { fit: "fill" });
    expect(chain.grayscale).toHaveBeenCalled();
    expect(chain.normalise).toHaveBeenCalled();
    expect(chain.raw).toHaveBeenCalled();
    expect(result).toEqual({ text: " @\n@ ", cols: 2, rows: 2 });
  });

  it("throws a typed error when the source image fetch fails", async () => {
    mockFetch(false);
    mockSharpChain([], 0, 0);
    await expect(imageToAscii("https://a.storyblok.com/missing.jpg", 1, 1)).rejects.toThrow(
      /source image fetch failed/,
    );
  });

  it("rethrows non-abort fetch errors verbatim", async () => {
    mockSharpChain([], 0, 0);
    globalThis.fetch = vi.fn(async () => {
      throw new TypeError("network down");
    });
    await expect(imageToAscii("https://a.storyblok.com/x.jpg", 1, 1)).rejects.toThrow(
      /network down/,
    );
  });

  it("aborts and surfaces a timeout error when the fetch hangs", async () => {
    mockSharpChain([], 0, 0);
    globalThis.fetch = vi.fn(
      async (_url, opts) =>
        new Promise<Response>((_, reject) => {
          const signal = (opts as { signal?: AbortSignal } | undefined)?.signal;
          signal?.addEventListener("abort", () => {
            const err = new Error("aborted");
            err.name = "AbortError";
            reject(err);
          });
        }),
    );
    vi.useFakeTimers();
    const assertion = expect(
      imageToAscii("https://a.storyblok.com/slow.jpg", 1, 1),
    ).rejects.toThrow(/timed out/);
    await vi.advanceTimersByTimeAsync(5_000);
    await assertion;
    vi.useRealTimers();
  });
});
