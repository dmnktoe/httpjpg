// @vitest-environment node

import { parseSseStream } from "./stream";

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

function sse(content: string): string {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<string[]> {
  const out: string[] = [];
  for await (const delta of parseSseStream(stream)) {
    out.push(delta);
  }
  return out;
}

describe("parseSseStream", () => {
  it("yields the content delta of each event in order", async () => {
    const deltas = await collect(toStream([sse("Hello"), sse(" "), sse("world")]));

    expect(deltas).toEqual(["Hello", " ", "world"]);
  });

  it("reassembles events split across network chunks", async () => {
    const event = sse("split");
    const deltas = await collect(
      toStream([event.slice(0, 12), event.slice(12, 25), event.slice(25)]),
    );

    expect(deltas).toEqual(["split"]);
  });

  it("stops at the [DONE] sentinel and ignores anything after it", async () => {
    const deltas = await collect(toStream([sse("kept"), "data: [DONE]\n\n", sse("dropped")]));

    expect(deltas).toEqual(["kept"]);
  });

  it("skips malformed frames instead of aborting the stream", async () => {
    const deltas = await collect(toStream([sse("before"), "data: {oops\n\n", sse("after")]));

    expect(deltas).toEqual(["before", "after"]);
  });

  it("skips keep-alive comments and empty deltas", async () => {
    const roleOnly = `data: ${JSON.stringify({ choices: [{ delta: {} }] })}\n\n`;
    const deltas = await collect(toStream([": keep-alive\n\n", roleOnly, sse("text")]));

    expect(deltas).toEqual(["text"]);
  });

  it("emits a final event that arrives without its trailing blank line", async () => {
    const deltas = await collect(
      toStream([
        sse("one"),
        `data: ${JSON.stringify({ choices: [{ delta: { content: "two" } }] })}`,
      ]),
    );

    expect(deltas).toEqual(["one", "two"]);
  });

  it("treats a null content delta as no output", async () => {
    const nulled = `data: ${JSON.stringify({ choices: [{ delta: { content: null } }] })}\n\n`;
    const deltas = await collect(toStream([nulled]));

    expect(deltas).toEqual([]);
  });

  it("splits events delimited by CRLF as well as LF", async () => {
    const crlf = (content: string) =>
      `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\r\n\r\n`;

    const deltas = await collect(toStream([crlf("one"), crlf("two"), "data: [DONE]\r\n\r\n"]));

    expect(deltas).toEqual(["one", "two"]);
  });

  it("returns nothing for an empty stream", async () => {
    const deltas = await collect(toStream([]));

    expect(deltas).toEqual([]);
  });
});
