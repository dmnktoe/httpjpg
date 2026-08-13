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

export interface AskNavigateAction {
  type: "navigate";
  href: string;
  title: string;
  kind: "work" | "page";
}

export interface AskActionEvent {
  type: "action";
  action: AskNavigateAction;
}

export type AskEvent = AskSourcesEvent | AskDeltaEvent | AskActionEvent | AskErrorEvent;

/**
 * Re-validates the action the server derived: same-origin, site-relative, and
 * not protocol-relative. The palette turns this straight into a link.
 */
function toNavigateAction(value: unknown): AskNavigateAction | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const action = value as Partial<AskNavigateAction>;
  if (action.type !== "navigate" || typeof action.title !== "string") {
    return null;
  }
  if (
    typeof action.href !== "string" ||
    !action.href.startsWith("/") ||
    action.href.startsWith("//")
  ) {
    return null;
  }
  return {
    type: "navigate",
    href: action.href,
    title: action.title,
    kind: action.kind === "work" ? "work" : "page",
  };
}

function toEvent(line: string): AskEvent | null {
  try {
    const parsed = JSON.parse(line) as Partial<AskEvent>;
    if (parsed.type === "sources") {
      return { type: "sources", sources: (parsed as AskSourcesEvent).sources ?? [] };
    }
    if (parsed.type === "delta" && typeof (parsed as AskDeltaEvent).text === "string") {
      return parsed as AskDeltaEvent;
    }
    if (parsed.type === "action") {
      const action = toNavigateAction((parsed as AskActionEvent).action);
      return action ? { type: "action", action } : null;
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
