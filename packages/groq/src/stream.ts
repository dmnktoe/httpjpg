interface StreamChoiceDelta {
  delta?: { content?: string | null };
  finish_reason?: string | null;
}

interface StreamChunk {
  choices?: StreamChoiceDelta[];
}

const SSE_DONE = "[DONE]";

/**
 * Turn a Groq SSE response body into the sequence of content deltas.
 *
 * The transport splits events on blank lines, but a network chunk can land
 * anywhere — mid-JSON, mid-line — so events are buffered until a terminator
 * arrives rather than parsed per chunk. Malformed payloads are skipped instead
 * of throwing: one bad frame should not truncate an otherwise good answer.
 */
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

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const event = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        const content = readEvent(event);
        if (content === SSE_DONE) {
          return;
        }
        if (content) {
          yield content;
        }

        boundary = buffer.indexOf("\n\n");
      }
    }

    // A final event without its trailing blank line still carries content.
    const trailing = readEvent(buffer);
    if (trailing && trailing !== SSE_DONE) {
      yield trailing;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Extract the content delta from one SSE event, or the `[DONE]` sentinel.
 * Returns an empty string for keep-alives, comments, and unparseable frames.
 */
function readEvent(event: string): string {
  const payload = event
    .split("\n")
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
