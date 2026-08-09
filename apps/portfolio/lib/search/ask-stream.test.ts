// @vitest-environment node

import { type AskEvent, readAskStream } from "./ask-stream";

function toStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

async function collect(chunks: string[]): Promise<AskEvent[]> {
  const events: AskEvent[] = [];
  for await (const event of readAskStream(toStream(chunks))) {
    events.push(event);
  }
  return events;
}

const SOURCES_LINE = `${JSON.stringify({
  type: "sources",
  sources: [{ title: "Demo", href: "/work/demo" }],
})}\n`;

describe("readAskStream", () => {
  it("yields each NDJSON event in order", async () => {
    const events = await collect([
      SOURCES_LINE,
      `${JSON.stringify({ type: "delta", text: "Hi" })}\n`,
      `${JSON.stringify({ type: "delta", text: " there" })}\n`,
    ]);

    expect(events).toEqual([
      { type: "sources", sources: [{ title: "Demo", href: "/work/demo" }] },
      { type: "delta", text: "Hi" },
      { type: "delta", text: " there" },
    ]);
  });

  it("reassembles a line split across chunks", async () => {
    const line = `${JSON.stringify({ type: "delta", text: "whole" })}\n`;

    const events = await collect([line.slice(0, 9), line.slice(9, 20), line.slice(20)]);

    expect(events).toEqual([{ type: "delta", text: "whole" }]);
  });

  it("yields a trailing line that has no newline", async () => {
    const events = await collect([JSON.stringify({ type: "delta", text: "last" })]);

    expect(events).toEqual([{ type: "delta", text: "last" }]);
  });

  it("skips malformed lines", async () => {
    const events = await collect([
      "{not json\n",
      `${JSON.stringify({ type: "delta", text: "kept" })}\n`,
    ]);

    expect(events).toEqual([{ type: "delta", text: "kept" }]);
  });

  it("skips lines with an unknown type or a non-string delta", async () => {
    const events = await collect([
      `${JSON.stringify({ type: "mystery" })}\n`,
      `${JSON.stringify({ type: "delta", text: 42 })}\n`,
    ]);

    expect(events).toEqual([]);
  });

  it("defaults a blank error code", async () => {
    const events = await collect([`${JSON.stringify({ type: "error" })}\n`]);

    expect(events).toEqual([{ type: "error", error: "ai_failed" }]);
  });

  it("defaults missing sources to an empty list", async () => {
    const events = await collect([`${JSON.stringify({ type: "sources" })}\n`]);

    expect(events).toEqual([{ type: "sources", sources: [] }]);
  });

  it("ignores blank lines", async () => {
    const events = await collect(["\n\n", `${JSON.stringify({ type: "delta", text: "x" })}\n`]);

    expect(events).toEqual([{ type: "delta", text: "x" }]);
  });

  it("returns nothing for an empty body", async () => {
    await expect(collect([])).resolves.toEqual([]);
  });
});
