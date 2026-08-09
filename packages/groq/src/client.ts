import { GroqApiError, GroqNotConfiguredError } from "./errors";
import { DEFAULT_GROQ_MODEL, type GroqModel } from "./models";
import { parseSseStream } from "./stream";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_TIMEOUT_MS = 15_000;

export type GroqRole = "system" | "user" | "assistant";

export interface GroqMessage {
  role: GroqRole;
  content: string;
}

export interface GroqClientOptions {
  apiKey: string | undefined;
  model?: GroqModel;
  baseUrl?: string;
  /** Overridable for tests; defaults to the global `fetch`. */
  fetchImpl?: typeof fetch;
}

export interface GroqCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface GroqClient {
  /** Resolves to the full answer text. */
  complete(messages: GroqMessage[], options?: GroqCompletionOptions): Promise<string>;
  /** Yields answer text incrementally as Groq produces it. */
  stream(
    messages: GroqMessage[],
    options?: GroqCompletionOptions,
  ): AsyncGenerator<string, void, undefined>;
}

interface CompletionResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
}

export function createGroqClient(options: GroqClientOptions): GroqClient {
  const { apiKey, model = DEFAULT_GROQ_MODEL, baseUrl = GROQ_BASE_URL } = options;
  const doFetch = options.fetchImpl ?? globalThis.fetch;

  async function request(
    messages: GroqMessage[],
    completionOptions: GroqCompletionOptions,
    stream: boolean,
  ): Promise<Response> {
    if (!apiKey) {
      throw new GroqNotConfiguredError();
    }

    const timeout = AbortSignal.timeout(completionOptions.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    const signal = completionOptions.signal
      ? AbortSignal.any([completionOptions.signal, timeout])
      : timeout;

    const response = await doFetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
        temperature: completionOptions.temperature ?? 0.3,
        max_tokens: completionOptions.maxTokens ?? 512,
      }),
      signal,
    });

    if (!response.ok) {
      throw new GroqApiError(response.status, await readErrorMessage(response));
    }

    return response;
  }

  return {
    async complete(messages, completionOptions = {}) {
      const response = await request(messages, completionOptions, false);
      const data = (await response.json()) as CompletionResponse;
      return data.choices?.[0]?.message?.content?.trim() ?? "";
    },

    async *stream(messages, completionOptions = {}) {
      const response = await request(messages, completionOptions, true);
      if (!response.body) {
        throw new GroqApiError(502, "Groq returned a streaming response with no body");
      }
      yield* parseSseStream(response.body);
    },
  };
}

/**
 * Groq reports failures as `{ error: { message } }`, but a gateway timeout or a
 * proxy in front of it can return HTML. Fall back to the status text rather
 * than letting a parse error mask the real failure.
 */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    if (body?.error?.message) {
      return body.error.message;
    }
  } catch {}
  return response.statusText || `Groq request failed with status ${response.status}`;
}
