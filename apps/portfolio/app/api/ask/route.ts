import { env } from "@httpjpg/env";
import { createGroqClient, GroqApiError } from "@httpjpg/groq";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { type NextRequest, NextResponse } from "next/server";

import { getSearchIndex } from "@/lib/queries/search-index";
import { enforceRateLimit } from "@/lib/rate-limit";
import { firstCitedSource } from "@/lib/search/citations";
import { buildAskMessages, MAX_QUESTION_LENGTH } from "@/lib/search/prompt";
import { rankDocuments } from "@/lib/search/ranking";

/** Sources per answer. */
const MAX_SOURCES = 5;

interface AskBody {
  question?: unknown;
}

const NO_MATCH_ANSWER =
  "I could not find anything about that on this site. Try a different wording, or browse the work list.";

/** Slim source shape the widget renders as citation links. */
interface AskSource {
  title: string;
  href: string;
  kind: "work" | "page";
}

/**
 * A destination the palette offers once the answer is complete, taken from
 * the source the model cited first. Only ever one of the sources already sent,
 * so it cannot point somewhere that does not exist.
 */
interface AskNavigateAction {
  type: "navigate";
  href: string;
  title: string;
  kind: "work" | "page";
}

function navigateAction(answer: string, sources: AskSource[]): AskNavigateAction | null {
  const cited = firstCitedSource(answer, sources.length);
  if (cited === null) {
    return null;
  }
  const source = sources[cited - 1];
  // Off-site sources open in a new tab from the citation list already; a
  // "go to" affordance should mean staying on the site.
  if (!source || !source.href.startsWith("/")) {
    return null;
  }
  return { type: "navigate", href: source.href, title: source.title, kind: source.kind };
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

  // With nothing retrieved the model can only say it does not know, so say it
  // here instead: no request, no bill, no room to invent a source.
  if (sources.length === 0) {
    return ndjson([
      { type: "sources", sources },
      { type: "delta", text: NO_MATCH_ANSWER },
    ]);
  }

  const client = createGroqClient({ apiKey: env.GROQ_API_KEY, model: env.GROQ_MODEL });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      };

      send({ type: "sources", sources });

      let answer = "";
      try {
        for await (const delta of client.stream(messages, { signal: request.signal })) {
          answer += delta;
          send({ type: "delta", text: delta });
        }

        // Last, so it can read the whole answer — and so a widget that stops
        // reading early simply never sees it.
        const action = navigateAction(answer, sources);
        if (action) {
          send({ type: "action", action });
        }
      } catch (error) {
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

  return ndjsonResponse(stream);
}

/** Sends a fixed set of NDJSON events, for answers that need no model call. */
function ndjson(events: unknown[]): Response {
  const encoder = new TextEncoder();
  const body = events.map((event) => `${JSON.stringify(event)}\n`).join("");
  return ndjsonResponse(encoder.encode(body));
}

function ndjsonResponse(body: BodyInit): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
