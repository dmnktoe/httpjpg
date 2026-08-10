// @vitest-environment node

import { beforeEach, vi } from "vitest";

const { envObj, mockStream } = vi.hoisted(() => ({
  envObj: { GROQ_API_KEY: "test-key" as string | undefined, GROQ_MODEL: "openai/gpt-oss-20b" },
  mockStream: vi.fn(),
}));

vi.mock("@httpjpg/env", () => ({ env: envObj }));

vi.mock("@httpjpg/groq", async () => {
  const actual = await vi.importActual<typeof import("@httpjpg/groq")>("@httpjpg/groq");
  return {
    ...actual,
    createGroqClient: vi.fn(() => ({ stream: mockStream, complete: vi.fn() })),
  };
});

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/queries/search-index", () => ({
  getSearchIndex: vi.fn(),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

import { createGroqClient, GroqApiError } from "@httpjpg/groq";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextRequest, NextResponse } from "next/server";

import { getSearchIndex } from "@/lib/queries/search-index";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { SearchDocument } from "@/lib/search/ranking";

import { POST } from "./route";

const mockGetSearchIndex = vi.mocked(getSearchIndex);
const mockEnforceRateLimit = vi.mocked(enforceRateLimit);
const mockCreateGroqClient = vi.mocked(createGroqClient);

const DOCUMENTS: SearchDocument[] = [
  {
    id: "1",
    href: "/work/brutalist-portfolio",
    title: "Brutalist Portfolio",
    kind: "work",
    tags: ["Websites"],
    tagValues: [],
    excerpt: "A stark site",
    date: "2026-01-01",
  },
];

const EXTERNAL_DOCUMENT: SearchDocument = {
  id: "2",
  href: "https://example.com/elsewhere",
  title: "Elsewhere",
  kind: "work",
  tags: [],
  tagValues: [],
  excerpt: "brutalist somewhere else",
};

function post(body: unknown, init?: { signal?: AbortSignal }): NextRequest {
  return new NextRequest("http://localhost/api/ask", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...init,
  });
}

async function readLines(response: Response): Promise<Array<Record<string, unknown>>> {
  const text = await response.text();
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

function yields(...chunks: string[]) {
  return async function* generate() {
    for (const chunk of chunks) {
      yield chunk;
    }
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  envObj.GROQ_API_KEY = "test-key";
  mockEnforceRateLimit.mockResolvedValue(null);
  mockGetSearchIndex.mockResolvedValue(DOCUMENTS);
  mockStream.mockImplementation(yields("Hello", " there"));
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/ask", () => {
  it("streams the sources first, then the answer deltas", async () => {
    const response = await POST(post({ question: "what is brutalist portfolio?" }));

    expect(response.headers.get("Content-Type")).toContain("application/x-ndjson");
    await expect(readLines(response)).resolves.toEqual([
      {
        type: "sources",
        sources: [
          { title: "Brutalist Portfolio", href: "/work/brutalist-portfolio", kind: "work" },
        ],
      },
      { type: "delta", text: "Hello" },
      { type: "delta", text: " there" },
    ]);
  });

  it("offers the first cited source as a navigate action once the answer ends", async () => {
    mockStream.mockImplementation(yields("It is the site itself", " [1]."));

    const lines = await readLines(await POST(post({ question: "brutalist portfolio?" })));

    expect(lines.at(-1)).toEqual({
      type: "action",
      action: {
        type: "navigate",
        href: "/work/brutalist-portfolio",
        title: "Brutalist Portfolio",
        kind: "work",
      },
    });
  });

  it("sends no action when the answer cites nothing", async () => {
    mockStream.mockImplementation(yields("I am not sure."));

    const lines = await readLines(await POST(post({ question: "brutalist portfolio?" })));

    expect(lines.some((line) => line.type === "action")).toBe(false);
  });

  // "go to" should mean staying on the site; the citation list already links out.
  it("sends no action when the cited source is external", async () => {
    mockGetSearchIndex.mockResolvedValue([EXTERNAL_DOCUMENT]);
    mockStream.mockImplementation(yields("Over there [1]."));

    const lines = await readLines(await POST(post({ question: "brutalist" })));

    expect(lines.some((line) => line.type === "action")).toBe(false);
  });

  it("sends no action when the answer failed mid-stream", async () => {
    mockStream.mockImplementation(async function* generate() {
      yield "Partly [1]";
      throw new GroqApiError(500, "upstream exploded");
    });

    const lines = await readLines(await POST(post({ question: "brutalist portfolio?" })));

    expect(lines.some((line) => line.type === "action")).toBe(false);
    expect(lines.at(-1)).toMatchObject({ type: "error" });
  });

  it("grounds the prompt in the ranked sources", async () => {
    await POST(post({ question: "tell me about brutalist" }));

    const [messages] = mockStream.mock.calls[0] as [Array<{ role: string; content: string }>];
    expect(messages[0]?.role).toBe("system");
    expect(messages[1]?.content).toContain("[1] Brutalist Portfolio");
    expect(messages[1]?.content).toContain("QUESTION: tell me about brutalist");
  });

  it("passes the configured model to the client", async () => {
    await POST(post({ question: "brutalist portfolio" }));

    expect(mockCreateGroqClient).toHaveBeenCalledWith({
      apiKey: "test-key",
      model: "openai/gpt-oss-20b",
    });
  });

  it("answers a zero-match question itself, without calling the model", async () => {
    mockGetSearchIndex.mockResolvedValue([]);

    const lines = await readLines(await POST(post({ question: "kubernetes?" })));

    expect(lines[0]).toEqual({ type: "sources", sources: [] });
    expect(lines[1]).toMatchObject({ type: "delta" });
    expect(String(lines[1]?.text)).toMatch(/could not find anything/i);
    expect(mockStream).not.toHaveBeenCalled();
  });

  it("returns 503 when no API key is configured", async () => {
    envObj.GROQ_API_KEY = undefined;

    const response = await POST(post({ question: "anything" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: "ai_unavailable" });
  });

  it("returns 400 for a malformed JSON body", async () => {
    const response = await POST(post("{not json"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_json" });
  });

  it("returns 400 for a missing or blank question", async () => {
    expect((await POST(post({}))).status).toBe(400);
    expect((await POST(post({ question: "   " }))).status).toBe(400);
    expect((await POST(post({ question: 42 }))).status).toBe(400);
  });

  it("returns 413 for an oversized question", async () => {
    const response = await POST(post({ question: "x".repeat(501) }));

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "question_too_long" });
  });

  it("returns the rate-limit response when the limiter denies the request", async () => {
    mockEnforceRateLimit.mockResolvedValue(
      NextResponse.json({ error: "rate_limited" }, { status: 429 }),
    );

    const response = await POST(post({ question: "hello there" }));

    expect(response.status).toBe(429);
    expect(mockStream).not.toHaveBeenCalled();
  });

  it("returns 500 when the search index cannot be read", async () => {
    mockGetSearchIndex.mockRejectedValue(new Error("index down"));

    const response = await POST(post({ question: "hello there" }));

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledWith(expect.any(Error), {
      tags: { route: "ask" },
    });
  });

  it("reports a transient upstream failure in-band as ai_busy", async () => {
    mockStream.mockImplementation(async function* failing() {
      yield "partial";
      throw new GroqApiError(429, "rate limited");
    });

    const lines = await readLines(await POST(post({ question: "brutalist portfolio" })));

    expect(lines.at(-1)).toEqual({ type: "error", error: "ai_busy" });
    expect(captureServerException).toHaveBeenCalledWith(expect.any(Error), {
      tags: { route: "ask", stage: "stream" },
    });
  });

  it("reports a permanent upstream failure in-band as ai_failed", async () => {
    // Fails before producing anything, so the widget only ever sees the error.
    // oxlint-disable-next-line eslint/require-yield
    mockStream.mockImplementation(async function* failing() {
      throw new GroqApiError(400, "bad request");
    });

    const lines = await readLines(await POST(post({ question: "brutalist portfolio" })));

    expect(lines.at(-1)).toEqual({ type: "error", error: "ai_failed" });
  });

  it("closes quietly when the client aborts mid-stream", async () => {
    const controller = new AbortController();
    mockStream.mockImplementation(async function* aborting() {
      yield "partial";
      controller.abort();
      throw new Error("aborted");
    });

    const lines = await readLines(
      await POST(post({ question: "brutalist portfolio" }, { signal: controller.signal })),
    );

    expect(lines.at(-1)).toEqual({ type: "delta", text: "partial" });
    expect(captureServerException).not.toHaveBeenCalled();
  });
});
