import { createGroqClient, GroqApiError } from "@httpjpg/ai";
import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";

import { API_ERROR, jsonError } from "@/lib/api/errors";
import { parseJsonBody } from "@/lib/api/json";
import { publicPost } from "@/lib/api/route";
import { getSearchIndex } from "@/lib/queries/search-index";
import { type AskNavigateAction, type AskSource, parseAskQuestion } from "@/lib/search/ask-schema";
import { firstCitedSource } from "@/lib/search/citations";
import { buildAskMessages } from "@/lib/search/prompt";
import { rankDocuments } from "@/lib/search/ranking";

/** Sources per answer. */
const MAX_SOURCES = 5;

const NO_MATCH_ANSWER =
  "I could not find anything about that on this site. Try a different wording, or browse the work list.";

/**
 * Derived from the finished answer rather than asked of the model: it can only
 * point at a source it was already handed, so there is no second call to pay
 * for and no way to invent a destination. External sources are skipped — the
 * offer is to navigate the site, not to leave it.
 */
function navigateAction(answer: string, sources: AskSource[]): AskNavigateAction | null {
  const cited = firstCitedSource(answer, sources.length);
  if (cited === null) {
    return null;
  }
  const source = sources[cited - 1];
  if (!source || !source.href.startsWith("/")) {
    return null;
  }
  return {
    type: "navigate",
    href: source.href,
    title: source.title,
    kind: source.kind ?? "page",
  };
}

export const POST = publicPost(
  "ask",
  async ({ request }) => {
    if (!env.GROQ_API_KEY) {
      return jsonError(API_ERROR.aiUnavailable, 503, {
        message: "Ask is not configured on this deployment",
      });
    }

    const parsed = await parseJsonBody(request);
    if (!parsed.ok) {
      return parsed.response;
    }

    const question = parseAskQuestion(parsed.data);
    if (!question.ok) {
      const isTooLong = question.error === "question_too_long";
      return jsonError(
        isTooLong ? API_ERROR.questionTooLong : API_ERROR.missingQuestion,
        isTooLong ? 413 : 400,
      );
    }

    let sources: AskSource[] = [];
    let messages;
    try {
      const documents = await getSearchIndex();
      const ranked = rankDocuments(documents, question.question, MAX_SOURCES);
      sources = ranked.map(({ title, href, kind }) => ({ title, href, kind }));
      messages = buildAskMessages(question.question, ranked);
    } catch (error) {
      console.error("Ask retrieval failed:", error);
      captureServerException(error, { tags: { route: "ask" } });
      return jsonError(API_ERROR.retrievalFailed, 500);
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
  },
  { withDraft: false },
);

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
