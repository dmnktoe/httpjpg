export interface AskSourcesEvent {
  type: "sources";
  sources: Array<{ title: string; href: string }>;
}

export interface AskDeltaEvent {
  type: "delta";
  text: string;
}

export interface AskErrorEvent {
  type: "error";
  error: string;
}

export type AskEvent = AskSourcesEvent | AskDeltaEvent | AskErrorEvent;

function toEvent(line: string): AskEvent | null {
  try {
    const parsed = JSON.parse(line) as Partial<AskEvent>;
    if (parsed.type === "sources") {
      return { type: "sources", sources: (parsed as AskSourcesEvent).sources ?? [] };
    }
    if (parsed.type === "delta" && typeof (parsed as AskDeltaEvent).text === "string") {
      return parsed as AskDeltaEvent;
    }
    if (parsed.type === "error") {
      return { type: "error", error: (parsed as AskErrorEvent).error || "ai_failed" };
    }
  } catch {}
  return null;
}

/** Read the `/api/ask` NDJSON body as typed events. */
export async function* readAskStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<AskEvent, void, undefined> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });

      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line) {
          const event = toEvent(line);
          if (event) {
            yield event;
          }
        }
        newline = buffer.indexOf("\n");
      }
    }

    const trailing = buffer.trim();
    if (trailing) {
      const event = toEvent(trailing);
      if (event) {
        yield event;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
