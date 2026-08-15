interface StreamChoiceDelta {
  delta?: { content?: string | null };
  finish_reason?: string | null;
}

interface StreamChunk {
  choices?: StreamChoiceDelta[];
}

const SSE_DONE = "[DONE]";

/** Turn a Groq SSE response body into its content deltas. Bad frames are skipped. */
export async function* parseSseStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string, void, undefined> {
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

      let boundary = findBoundary(buffer);
      while (boundary) {
        const event = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary.length);

        const content = readEvent(event);
        if (content === SSE_DONE) {
          return;
        }
        if (content) {
          yield content;
        }

        boundary = findBoundary(buffer);
      }
    }

    const trailing = readEvent(buffer);
    if (trailing && trailing !== SSE_DONE) {
      yield trailing;
    }
  } finally {
    reader.releaseLock();
  }
}

/** SSE separates events with a blank line, which may be LF or CRLF. */
function findBoundary(buffer: string): { index: number; length: number } | null {
  const lf = buffer.indexOf("\n\n");
  const crlf = buffer.indexOf("\r\n\r\n");
  if (crlf !== -1 && (lf === -1 || crlf < lf)) {
    return { index: crlf, length: 4 };
  }
  return lf === -1 ? null : { index: lf, length: 2 };
}

/** Content delta of one event, the `[DONE]` sentinel, or "" for anything else. */
function readEvent(event: string): string {
  const payload = event
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("");

  if (!payload) {
    return "";
  }
  if (payload === SSE_DONE) {
    return SSE_DONE;
  }

  try {
    const chunk = JSON.parse(payload) as StreamChunk;
    return chunk.choices?.[0]?.delta?.content ?? "";
  } catch {
    return "";
  }
}
