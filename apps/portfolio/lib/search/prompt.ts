import type { GroqMessage } from "@httpjpg/ai";

import type { SearchDocument } from "./ranking";

const SYSTEM_PROMPT = [
  "You are the assistant embedded in Dominik's portfolio site.",
  "Answer questions about the work, projects, and pages listed in the SOURCES block.",
  "Rules:",
  "- Use only the SOURCES. Never invent projects, dates, clients, or links.",
  "- If the sources do not cover the question, say so plainly and suggest what is there.",
  "- Cite the sources you used as bracketed numbers, e.g. [1] or [1][3].",
  "- Answer in at most three short sentences. No preamble, no sign-off.",
  "- Reply in the language the question was asked in.",
].join("\n");

/** Hard cap on question length. */
export const MAX_QUESTION_LENGTH = 500;

/** Build the grounded chat messages. Sources are numbered so the model can cite them. */
export function buildAskMessages(question: string, sources: SearchDocument[]): GroqMessage[] {
  const context = sources
    .map((source, index) => {
      const parts = [`[${index + 1}] ${source.title}`, `path: ${source.href}`];
      if (source.tags.length > 0) {
        parts.push(`tags: ${source.tags.join(", ")}`);
      }
      if (source.date) {
        parts.push(`date: ${source.date.slice(0, 10)}`);
      }
      if (source.excerpt) {
        parts.push(source.excerpt.slice(0, 600));
      }
      return parts.join("\n");
    })
    .join("\n\n");

  return [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `SOURCES:\n${context || "(no matching content)"}\n\nQUESTION: ${question.slice(0, MAX_QUESTION_LENGTH)}`,
    },
  ];
}
