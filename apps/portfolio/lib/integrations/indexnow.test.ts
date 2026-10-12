// @vitest-environment node
import { submitIndexNow } from "./indexnow";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("submitIndexNow", () => {
  it("posts host, key, key location and deduplicated urls", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));

    const result = await submitIndexNow({
      baseUrl: "https://httpjpg.com/",
      key: "abcdef123456",
      urls: ["https://httpjpg.com/a", "https://httpjpg.com/a", "https://httpjpg.com/b"],
    });

    expect(result.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.indexnow.org/indexnow");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      host: "httpjpg.com",
      key: "abcdef123456",
      keyLocation: "https://httpjpg.com/indexnow.txt",
      urlList: ["https://httpjpg.com/a", "https://httpjpg.com/b"],
    });
  });

  it("surfaces a rejected key as a failure", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));

    const result = await submitIndexNow({
      baseUrl: "https://httpjpg.com",
      key: "abcdef123456",
      urls: ["https://httpjpg.com/a"],
    });

    expect(result).toEqual(expect.objectContaining({ ok: false, status: 403 }));
  });
});
