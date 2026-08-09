import { env } from "@httpjpg/env";
import { createGroqClient, GroqApiError } from "@httpjpg/groq";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { type NextRequest, NextResponse } from "next/server";

import { getSearchIndex } from "@/lib/queries/search-index";
import { enforceRateLimit } from "@/lib/rate-limit";
import { buildAskMessages, MAX_QUESTION_LENGTH } from "@/lib/search/prompt";
import { rankDocuments } from "@/lib/search/ranking";

/** Enough context to answer without pushing the prompt (and the bill) up. */
const MAX_SOURCES = 5;

interface AskBody {
  question?: unknown;
}

/** The slim source shape the widget renders as citation links. */
interface AskSource {
  title: string;
  href: string;
  kind: "work" | "page";
}

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }

  if (!env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "ai_unavailable", message: "Ask is not configured on this deployment" },
      { status: 503 },
    );
  }

  let body: AskBody;
  try {
    body = (await request.json()) as AskBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "missing_question" }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json({ error: "question_too_long" }, { status: 413 });
  }

  let sources: AskSource[] = [];
  let messages;
  try {
    const documents = await getSearchIndex();
    const ranked = rankDocuments(documents, question, MAX_SOURCES);
    sources = ranked.map(({ title, href, kind }) => ({ title, href, kind }));
    messages = buildAskMessages(question, ranked);
  } catch (error) {
    console.error("Ask retrieval failed:", error);
    captureServerException(error, { tags: { route: "ask" } });
    return NextResponse.json({ error: "retrieval_failed" }, { status: 500 });
  }

  const client = createGroqClient({ apiKey: env.GROQ_API_KEY, model: env.GROQ_MODEL });
  const encoder = new TextEncoder();

  // NDJSON rather than SSE: the sources have to reach the widget before the
  // first token so it can render citation links while the answer types in, and
  // one JSON object per line is the cheapest framing that carries both.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      };

      send({ type: "sources", sources });

      try {
        for await (const delta of client.stream(messages, { signal: request.signal })) {
          send({ type: "delta", text: delta });
        }
      } catch (error) {
        // The stream already has a 200 status and partial content, so a failure
        // here can only be reported in-band. The widget shows it as an error.
        if (request.signal.aborted) {
          controller.close();
          return;
        }
        const isUpstream = error instanceof GroqApiError;
        console.error("Ask streaming failed:", error);
        captureServerException(error, { tags: { route: "ask", stage: "stream" } });
        send({
          type: "error",
          error: isUpstream && error.isTransient ? "ai_busy" : "ai_failed",
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
