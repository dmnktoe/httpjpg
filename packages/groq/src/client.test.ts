// @vitest-environment node

import type { MockedFunction } from "vitest";

import { createGroqClient, type GroqMessage } from "./client";
import { GroqApiError, GroqNotConfiguredError } from "./errors";
import { GROQ_MODELS } from "./models";

const MESSAGES: GroqMessage[] = [{ role: "user", content: "who are you?" }];

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function sseResponse(events: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(event));
      }
      controller.close();
    },
  });
  return new Response(body, { status: 200 });
}

function delta(content: string): string {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;
}

let fetchImpl: MockedFunction<typeof fetch>;

beforeEach(() => {
  fetchImpl = vi.fn() as MockedFunction<typeof fetch>;
});

describe("createGroqClient", () => {
  describe("complete", () => {
    it("returns the trimmed assistant message", async () => {
      fetchImpl.mockResolvedValue(
        jsonResponse({ choices: [{ message: { content: "  an answer  " } }] }),
      );
      const client = createGroqClient({ apiKey: "key", fetchImpl });

      await expect(client.complete(MESSAGES)).resolves.toBe("an answer");
    });

    it("sends the key, model, and messages Groq expects", async () => {
      fetchImpl.mockResolvedValue(jsonResponse({ choices: [{ message: { content: "ok" } }] }));
      const client = createGroqClient({
        apiKey: "secret-key",
        model: GROQ_MODELS.versatile,
        fetchImpl,
      });

      await client.complete(MESSAGES, { temperature: 0.9, maxTokens: 64 });

      const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
      expect((init.headers as Record<string, string>).Authorization).toBe("Bearer secret-key");
      expect(JSON.parse(init.body as string)).toMatchObject({
        model: GROQ_MODELS.versatile,
        messages: MESSAGES,
        stream: false,
        temperature: 0.9,
        max_tokens: 64,
      });
    });

    it("returns an empty string when Groq returns no choices", async () => {
      fetchImpl.mockResolvedValue(jsonResponse({ choices: [] }));
      const client = createGroqClient({ apiKey: "key", fetchImpl });

      await expect(client.complete(MESSAGES)).resolves.toBe("");
    });

    it("honours a custom base URL", async () => {
      fetchImpl.mockResolvedValue(jsonResponse({ choices: [{ message: { content: "ok" } }] }));
      const client = createGroqClient({
        apiKey: "key",
        baseUrl: "https://proxy.test/v1",
        fetchImpl,
      });

      await client.complete(MESSAGES);

      expect(fetchImpl.mock.calls[0]?.[0]).toBe("https://proxy.test/v1/chat/completions");
    });
  });

  describe("stream", () => {
    it("yields each content delta", async () => {
      fetchImpl.mockResolvedValue(sseResponse([delta("st"), delta("ream"), "data: [DONE]\n\n"]));
      const client = createGroqClient({ apiKey: "key", fetchImpl });

      const chunks: string[] = [];
      for await (const chunk of client.stream(MESSAGES)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(["st", "ream"]);
      expect(JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string).stream).toBe(true);
    });

    it("throws when the streaming response has no body", async () => {
      fetchImpl.mockResolvedValue(new Response(null, { status: 200 }));
      const client = createGroqClient({ apiKey: "key", fetchImpl });

      const iterator = client.stream(MESSAGES);

      await expect(iterator.next()).rejects.toThrow(GroqApiError);
    });
  });

  describe("failures", () => {
    it("throws GroqNotConfiguredError when no key is set", async () => {
      const client = createGroqClient({ apiKey: undefined, fetchImpl });

      await expect(client.complete(MESSAGES)).rejects.toThrow(GroqNotConfiguredError);
      expect(fetchImpl).not.toHaveBeenCalled();
    });

    it("surfaces the upstream error message and status", async () => {
      fetchImpl.mockResolvedValue(
        jsonResponse({ error: { message: "rate limit reached" } }, { status: 429 }),
      );
      const client = createGroqClient({ apiKey: "key", fetchImpl });

      await expect(client.complete(MESSAGES)).rejects.toMatchObject({
        name: "GroqApiError",
        status: 429,
        message: "rate limit reached",
      });
    });

    it("falls back to the status text when the error body is not JSON", async () => {
      fetchImpl.mockResolvedValue(
        new Response("<html>gateway timeout</html>", {
          status: 504,
          statusText: "Gateway Timeout",
        }),
      );
      const client = createGroqClient({ apiKey: "key", fetchImpl });

      await expect(client.complete(MESSAGES)).rejects.toMatchObject({
        status: 504,
        message: "Gateway Timeout",
      });
    });

    it("falls back to a generated message when there is no status text either", async () => {
      fetchImpl.mockResolvedValue(new Response("nope", { status: 418, statusText: "" }));
      const client = createGroqClient({ apiKey: "key", fetchImpl });

      await expect(client.complete(MESSAGES)).rejects.toThrow(
        "Groq request failed with status 418",
      );
    });

    it("aborts the request when the caller's signal fires", async () => {
      fetchImpl.mockImplementation((_url, init) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        });
      });
      const controller = new AbortController();
      const client = createGroqClient({ apiKey: "key", fetchImpl });

      const pending = client.complete(MESSAGES, { signal: controller.signal });
      controller.abort();

      await expect(pending).rejects.toThrow("aborted");
    });
  });
});

describe("GroqApiError", () => {
  it("treats rate limits and server errors as transient", () => {
    expect(new GroqApiError(429, "slow down").isTransient).toBe(true);
    expect(new GroqApiError(503, "down").isTransient).toBe(true);
  });

  it("treats client errors as permanent", () => {
    expect(new GroqApiError(400, "bad request").isTransient).toBe(false);
  });
});
