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

    const trailing = readEvent(buffer);
    if (trailing && trailing !== SSE_DONE) {
      yield trailing;
    }
  } finally {
    reader.releaseLock();
  }
}

/** Content delta of one event, the `[DONE]` sentinel, or "" for anything else. */
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
