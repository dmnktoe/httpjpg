// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

const { lookup } = vi.hoisted(() => ({ lookup: vi.fn() }));
vi.mock("node:dns/promises", () => ({ lookup }));

import {
  extractIconCandidates,
  fallbackIconUrls,
  fetchFavicon,
  isHttpUrl,
  isPrivateAddress,
  sniffContentType,
} from "./favicon";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const ICO = Uint8Array.from([0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10]);

function htmlResponse(html: string, url = "https://example.com/"): Response {
  return {
    ok: true,
    status: 200,
    url,
    headers: new Headers({ "content-type": "text/html; charset=utf-8" }),
    arrayBuffer: async () => new TextEncoder().encode(html).buffer,
  } as unknown as Response;
}

function binaryResponse(bytes: Uint8Array, url = "https://example.com/favicon.ico"): Response {
  return {
    ok: true,
    status: 200,
    url,
    headers: new Headers({ "content-type": "application/octet-stream" }),
    arrayBuffer: async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  } as unknown as Response;
}

function streamedHtmlResponse(head: string, tailBytes: number): Response {
  const chunks = [new TextEncoder().encode(head)];
  for (let sent = 0; sent < tailBytes; sent += 64 * 1024) {
    chunks.push(new TextEncoder().encode("x".repeat(64 * 1024)));
  }
  let index = 0;

  return {
    ok: true,
    status: 200,
    url: "https://example.com/",
    headers: new Headers({ "content-type": "text/html" }),
    body: {
      getReader: () => ({
        read: async () =>
          index < chunks.length ? { done: false, value: chunks[index++] } : { done: true },
        cancel: async () => undefined,
      }),
    },
    arrayBuffer: async () => {
      throw new Error("should stream instead of buffering");
    },
  } as unknown as Response;
}

function streamedBinaryResponse(bytes: Uint8Array, extraBytes = 0): Response {
  const chunks = [bytes];
  if (extraBytes > 0) {
    chunks.push(new Uint8Array(extraBytes));
  }
  let index = 0;

  return {
    ok: true,
    status: 200,
    url: "https://example.com/favicon.ico",
    headers: new Headers({ "content-type": "application/octet-stream" }),
    body: {
      getReader: () => ({
        read: async () =>
          index < chunks.length ? { done: false, value: chunks[index++] } : { done: true },
        cancel: async () => undefined,
      }),
    },
    arrayBuffer: async () => {
      throw new Error("should stream instead of buffering");
    },
  } as unknown as Response;
}

function notFoundResponse(url = "https://example.com/favicon.ico"): Response {
  return {
    ok: false,
    status: 404,
    url,
    headers: new Headers(),
    arrayBuffer: async () => new ArrayBuffer(0),
  } as unknown as Response;
}

beforeEach(() => {
  vi.clearAllMocks();
  lookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
});

describe("isHttpUrl", () => {
  it("accepts http and https", () => {
    expect(isHttpUrl("https://example.com/x")?.hostname).toBe("example.com");
    expect(isHttpUrl("http://example.com")?.hostname).toBe("example.com");
  });

  it("rejects other protocols, credentials and garbage", () => {
    expect(isHttpUrl("file:///etc/passwd")).toBeNull();
    expect(isHttpUrl("javascript:alert(1)")).toBeNull();
    expect(isHttpUrl("https://user:pass@example.com")).toBeNull();
    expect(isHttpUrl("nope")).toBeNull();
  });
});

describe("isPrivateAddress", () => {
  it("flags loopback, link-local, RFC1918 and CGNAT ranges", () => {
    for (const ip of [
      "127.0.0.1",
      "10.1.2.3",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.1.1",
      "169.254.169.254",
      "100.64.0.1",
      "0.0.0.0",
      "198.18.0.1",
      "224.0.0.1",
      "::1",
      "::",
      "fd00::1",
      "fe80::1",
      "::ffff:127.0.0.1",
    ]) {
      expect(isPrivateAddress(ip)).toBe(true);
    }
  });

  it("allows public addresses", () => {
    expect(isPrivateAddress("93.184.216.34")).toBe(false);
    expect(isPrivateAddress("172.32.0.1")).toBe(false);
    expect(isPrivateAddress("2606:4700::1")).toBe(false);
    expect(isPrivateAddress("192.0.0.1")).toBe(true);
    expect(isPrivateAddress("198.19.1.1")).toBe(true);
  });

  it("treats malformed input as private", () => {
    expect(isPrivateAddress("1.2.3")).toBe(true);
  });
});

describe("sniffContentType", () => {
  it("recognises image magic bytes", () => {
    expect(sniffContentType(PNG)).toBe("image/png");
    expect(sniffContentType(ICO)).toBe("image/x-icon");
    expect(sniffContentType(new TextEncoder().encode("GIF89a..."))).toBe("image/gif");
    expect(sniffContentType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffContentType(new TextEncoder().encode('<svg xmlns="x"/>'))).toBe("image/svg+xml");
  });

  it("returns null for HTML error pages and short bodies", () => {
    expect(sniffContentType(new TextEncoder().encode("<!doctype html><html>404"))).toBeNull();
    expect(sniffContentType(Uint8Array.from([0x00]))).toBeNull();
  });

  it("recognises bmp, webp and xml-wrapped svg", () => {
    expect(sniffContentType(Uint8Array.from([0x42, 0x4d, 0x00, 0x00]))).toBe("image/bmp");
    const webp = new Uint8Array(12);
    webp.set([0x52, 0x49, 0x46, 0x46], 0);
    webp.set([0x57, 0x45, 0x42, 0x50], 8);
    expect(sniffContentType(webp)).toBe("image/webp");
    expect(
      sniffContentType(new TextEncoder().encode('<?xml version="1.0"?><svg xmlns="x"/>')),
    ).toBe("image/svg+xml");
  });
});

describe("extractIconCandidates", () => {
  it("picks up icon rels and ignores everything else", () => {
    const candidates = extractIconCandidates(`
      <head>
        <link rel="stylesheet" href="/app.css">
        <link rel="icon" sizes="32x32" href="/icon-32.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple.png">
        <link rel="mask-icon" href="/mask.svg">
      </head>
      <body><link rel="icon" href="/body.png"></body>
    `);

    expect(candidates.map((candidate) => candidate.href)).toEqual(["/icon-32.png", "/apple.png"]);
  });

  it("reads rel as a token list", () => {
    const candidates = extractIconCandidates(`
      <link rel="shortcut icon" href="/a.ico">
      <link rel="ICON" href="/b.png">
      <link rel="icon shortcut" href="/c.png">
      <link rel="fluid-icon" href="/d.png">
      <link rel="preload" href="/e.png">
    `);

    expect(candidates.map((candidate) => candidate.href)).toEqual(["/a.ico", "/b.png", "/c.png"]);
  });

  it("reads unquoted and single-quoted attribute values", () => {
    const candidates = extractIconCandidates(`
      <link rel=icon href=/bare.ico>
      <link rel='apple-touch-icon' sizes='180x180' href='/single.png'>
    `);

    expect(candidates.map((candidate) => candidate.href)).toEqual(["/bare.ico", "/single.png"]);
    expect(candidates[1].sizes).toBe("180x180");
  });

  it("keeps a data: href that carries quotes of its own", () => {
    const [candidate] = extractIconCandidates(
      `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>">`,
    );

    expect(candidate.href).toBe("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>");
  });

  it("decodes entity-escaped hrefs", () => {
    const [candidate] = extractIconCandidates(`<link rel="icon" href="/i.png?a=1&amp;b=2">`);
    expect(candidate.href).toBe("/i.png?a=1&b=2");
  });
});

describe("fallbackIconUrls", () => {
  it("tries the page directory before the origin", () => {
    expect(fallbackIconUrls(new URL("https://dmnktoe.github.io/buli-tabelle/"))).toEqual([
      "https://dmnktoe.github.io/buli-tabelle/favicon.ico",
      "https://dmnktoe.github.io/favicon.ico",
    ]);
  });

  it("only returns the origin for root pages", () => {
    expect(fallbackIconUrls(new URL("https://example.com/"))).toEqual([
      "https://example.com/favicon.ico",
    ]);
  });
});

describe("fetchFavicon", () => {
  it("rejects non-http URLs before touching the network", async () => {
    await expect(fetchFavicon("file:///etc/passwd")).resolves.toMatchObject({
      ok: false,
      status: 400,
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("resolves the icon declared by a project page", async () => {
    mockFetch
      .mockResolvedValueOnce(
        htmlResponse(
          `<head><link rel="icon" href="favicon.ico"></head>`,
          "https://dmnktoe.github.io/buli-tabelle/",
        ),
      )
      .mockResolvedValueOnce(binaryResponse(ICO));

    const result = await fetchFavicon("https://dmnktoe.github.io/buli-tabelle/");

    expect(result).toMatchObject({ ok: true, contentType: "image/x-icon" });
    expect(mockFetch.mock.calls[1][0]).toMatchObject({
      href: "https://dmnktoe.github.io/buli-tabelle/favicon.ico",
    });
  });

  it("falls back to the page directory when the HTML declares nothing", async () => {
    mockFetch
      .mockResolvedValueOnce(
        htmlResponse("<head><title>x</title></head>", "https://dmnktoe.github.io/buli-tabelle/"),
      )
      .mockResolvedValueOnce(binaryResponse(PNG));

    const result = await fetchFavicon("https://dmnktoe.github.io/buli-tabelle/");

    expect(result).toMatchObject({ ok: true, contentType: "image/png" });
    expect(mockFetch.mock.calls[1][0]).toMatchObject({
      href: "https://dmnktoe.github.io/buli-tabelle/favicon.ico",
    });
  });

  it("reads the head of a page that dwarfs the byte cap", async () => {
    mockFetch
      .mockResolvedValueOnce(
        streamedHtmlResponse(
          `<head><link rel="icon" href="/declared.png"></head>`,
          2 * 1024 * 1024,
        ),
      )
      .mockResolvedValueOnce(binaryResponse(PNG));

    const result = await fetchFavicon("https://example.com/");

    expect(result).toMatchObject({ ok: true });
    expect(mockFetch.mock.calls[1][0]).toMatchObject({ href: "https://example.com/declared.png" });
  });

  it("skips candidates that answer with a non-image body", async () => {
    mockFetch
      .mockResolvedValueOnce(htmlResponse(`<head><link rel="icon" href="/broken.png"></head>`))
      .mockResolvedValueOnce(binaryResponse(new TextEncoder().encode("<!doctype html>404")))
      .mockResolvedValueOnce(binaryResponse(PNG));

    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({
      ok: true,
      contentType: "image/png",
    });
  });

  it("prefers the smallest icon that still covers the requested size", async () => {
    mockFetch
      .mockResolvedValueOnce(
        htmlResponse(`
          <head>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple.png">
            <link rel="icon" sizes="16x16" href="/small.png">
            <link rel="icon" sizes="32x32" href="/medium.png">
          </head>
        `),
      )
      .mockResolvedValueOnce(binaryResponse(PNG));

    await fetchFavicon("https://example.com/", 32);

    expect(mockFetch.mock.calls[1][0]).toMatchObject({ href: "https://example.com/medium.png" });
  });

  it("reads a minified head with unquoted attributes", async () => {
    mockFetch
      .mockResolvedValueOnce(
        htmlResponse(
          `<!doctype html><html lang=de><meta charset=UTF-8><title>x</title>` +
            `<link rel=icon type=image/svg+xml href=/static/favicon.svg>` +
            `<link rel=icon type=image/png sizes=32x32 href=/static/assets/favicon/favicon-32x32.png>` +
            `<link rel=icon type=image/png sizes=16x16 href=/static/assets/favicon/favicon-16x16.png>` +
            `<link rel="shortcut icon" href=/static/assets/favicon/favicon.ico>` +
            `<link rel=apple-touch-icon sizes=180x180 href=/static/assets/favicon/apple-touch-icon.png>` +
            `<link rel=manifest href=/static/site.webmanifest>`,
          "https://id-100.online/",
        ),
      )
      .mockResolvedValueOnce(binaryResponse(PNG));

    const result = await fetchFavicon("https://id-100.online/");

    expect(result).toMatchObject({ ok: true, contentType: "image/png" });
    expect(mockFetch.mock.calls[1][0]).toMatchObject({
      href: "https://id-100.online/static/assets/favicon/favicon-16x16.png",
    });
  });

  it("decodes inline data: icons", async () => {
    const base64 = Buffer.from(PNG).toString("base64");
    mockFetch.mockResolvedValueOnce(
      htmlResponse(`<head><link rel="icon" href="data:image/png;base64,${base64}"></head>`),
    );

    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({
      ok: true,
      contentType: "image/png",
      source: "data:",
    });
  });

  it("returns a 404 result when nothing resolves", async () => {
    mockFetch.mockResolvedValue(notFoundResponse());

    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({
      ok: false,
      status: 404,
    });
  });

  it("refuses hosts that resolve to a private address", async () => {
    lookup.mockResolvedValue([{ address: "169.254.169.254", family: 4 }]);
    mockFetch.mockResolvedValue(binaryResponse(PNG));

    await expect(fetchFavicon("https://metadata.internal/")).resolves.toMatchObject({ ok: false });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("refuses a redirect that lands on a private host", async () => {
    lookup.mockImplementation(async (host: string) =>
      host === "example.com"
        ? [{ address: "93.184.216.34", family: 4 }]
        : [{ address: "127.0.0.1", family: 4 }],
    );
    mockFetch.mockResolvedValue({
      ok: false,
      status: 302,
      url: "https://example.com/",
      headers: new Headers({ location: "http://localhost:8080/secret" }),
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as Response);

    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({ ok: false });
  });

  it("gives up on oversized bodies", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      url: "https://example.com/favicon.ico",
      headers: new Headers({ "content-length": String(10 * 1024 * 1024) }),
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as Response);

    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({ ok: false });
  });

  it("stops reading an icon that exceeds the byte cap without a content-length", async () => {
    mockFetch
      .mockResolvedValueOnce(htmlResponse("<head><title>x</title></head>"))
      .mockResolvedValueOnce(streamedBinaryResponse(ICO, 600 * 1024));

    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({ ok: false });
  });

  it("streams an icon body instead of buffering it whole", async () => {
    mockFetch
      .mockResolvedValueOnce(htmlResponse("<head><title>x</title></head>"))
      .mockResolvedValueOnce(streamedBinaryResponse(ICO));

    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({
      ok: true,
      contentType: "image/x-icon",
    });
  });

  it("survives a network failure on the page fetch", async () => {
    mockFetch.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce(binaryResponse(ICO));

    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({ ok: true });
  });

  it("rejects localhost and hosts whose DNS lookup fails", async () => {
    await expect(fetchFavicon("https://localhost/")).resolves.toMatchObject({ ok: false });
    lookup.mockRejectedValueOnce(new Error("ENOTFOUND"));
    await expect(fetchFavicon("https://missing.example/")).resolves.toMatchObject({ ok: false });
  });

  it("follows a 302 without a location as a terminal response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 302,
      url: "https://example.com/",
      headers: new Headers(),
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as Response);

    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({ ok: false });
  });

  it("skips a non-html page body and invalid icon hrefs", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      url: "https://example.com/",
      headers: new Headers({ "content-type": "application/json" }),
      arrayBuffer: async () => new TextEncoder().encode("{}").buffer,
    } as unknown as Response);

    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({ ok: false });
  });

  it("decodes a percent-encoded svg data url and ignores non-images", async () => {
    const svg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    mockFetch.mockResolvedValueOnce(
      htmlResponse(`<head><link rel="icon" href="data:image/svg+xml,${svg}"></head>`),
    );
    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({
      ok: true,
      contentType: "image/svg+xml",
    });

    mockFetch.mockResolvedValueOnce(
      htmlResponse(`<head><link rel="icon" href="data:text/plain,hello"></head>`),
    );
    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({ ok: false });
  });

  it("prefers sizes=any over a too-small bitmap", async () => {
    mockFetch
      .mockResolvedValueOnce(
        htmlResponse(`
          <head>
            <link rel="icon" sizes="16x16" href="/small.png">
            <link rel="icon" sizes="any" href="/vector.svg">
          </head>
        `),
      )
      .mockResolvedValueOnce(binaryResponse(PNG));

    await fetchFavicon("https://example.com/", 32);
    expect(mockFetch.mock.calls[1][0]).toMatchObject({ href: "https://example.com/vector.svg" });
  });

  it("gives up on a redirect to a non-http location", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 302,
      url: "https://example.com/",
      headers: new Headers({ location: "ftp://files.example/icon.ico" }),
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as Response);

    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({ ok: false });
  });

  it("treats a throwing body reader as a failed icon", async () => {
    mockFetch
      .mockResolvedValueOnce(htmlResponse("<head><title>x</title></head>"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        url: "https://example.com/favicon.ico",
        headers: new Headers({ "content-type": "image/x-icon" }),
        body: {
          getReader: () => ({
            read: async () => {
              throw new Error("stream");
            },
            cancel: async () => {
              throw new Error("cancel");
            },
          }),
        },
        arrayBuffer: async () => new ArrayBuffer(0),
      } as unknown as Response);

    await expect(fetchFavicon("https://example.com/")).resolves.toMatchObject({ ok: false });
  });

  it("sniffs a Windows cursor and ranks apple-touch below a covering icon", async () => {
    const cursor = Uint8Array.from([0x00, 0x00, 0x02, 0x00]);
    expect(sniffContentType(cursor)).toBe("image/x-icon");

    mockFetch
      .mockResolvedValueOnce(
        htmlResponse(`
          <head>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple.png">
            <link rel="icon" sizes="32x32" href="/icon.png">
          </head>
        `),
      )
      .mockResolvedValueOnce(binaryResponse(PNG, "https://example.com/icon.png"));

    await fetchFavicon("https://example.com/", 32);
    expect(String(mockFetch.mock.calls[1][0])).toContain("icon.png");
  });

  it("falls back to a directory favicon.ico and skips a javascript icon href", async () => {
    mockFetch
      .mockResolvedValueOnce(
        htmlResponse(`<head><link rel="icon" href="javascript:alert(1)"></head>`),
      )
      .mockResolvedValueOnce(notFoundResponse("https://example.com/blog/favicon.ico"))
      .mockResolvedValueOnce(binaryResponse(ICO, "https://example.com/favicon.ico"));

    await expect(fetchFavicon("https://example.com/blog/post")).resolves.toMatchObject({
      ok: true,
      contentType: "image/x-icon",
    });
  });

  it("flags fc/fe ipv6 unique-local and link-local ranges", () => {
    expect(isPrivateAddress("fc00::1")).toBe(true);
    expect(isPrivateAddress("fe90::1")).toBe(true);
    expect(isPrivateAddress("fea0::1")).toBe(true);
    expect(isPrivateAddress("feb0::1")).toBe(true);
  });
});
