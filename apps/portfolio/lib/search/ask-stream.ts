import { type AskEvent, askEventSchema } from "./ask-schema";

export type { AskEvent, AskNavigateAction, AskSource } from "./ask-schema";

function toEvent(line: string): AskEvent | null {
  try {
    const parsed = askEventSchema.safeParse(JSON.parse(line));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
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
