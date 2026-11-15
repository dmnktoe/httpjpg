import type { GroqMessage } from "@httpjpg/ai";

import { selectPassages } from "./passages";
import { queryTerms, rankDocuments, type SearchDocument } from "./ranking";

export const MAX_QUESTION_LENGTH = 500;

const MAX_RANKED = 5;

const MAX_CATALOG = 40;

const PASSAGE_BUDGET = 700;

const SUMMARY_LENGTH = 160;

export interface AskSources {
  ranked: SearchDocument[];
  catalog: SearchDocument[];
}

export function selectAskSources(documents: SearchDocument[], question: string): AskSources {
  const ranked = rankDocuments(documents, question, MAX_RANKED);
  const rankedIds = new Set(ranked.map((document) => document.id));
  const catalog = documents
    .filter((document) => document.kind === "work" && !rankedIds.has(document.id))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title))
    .slice(0, MAX_CATALOG);
  return { ranked, catalog };
}

/** Build the grounded chat messages. Sources are numbered so the model can cite them. */
export function buildAskMessages(
  question: string,
  { ranked, catalog }: AskSources,
  now: Date = new Date(),
): GroqMessage[] {
  const today = now.toISOString().slice(0, 10);
  const terms = queryTerms(question);

  const detailed = ranked.map((source, index) => {
    const parts = [`[${index + 1}] ${source.title}`, `path: ${source.href}`];
    if (source.tags.length > 0) {
      parts.push(`tags: ${source.tags.join(", ")}`);
    }
    if (source.date) {
      parts.push(`date: ${describeDate(source.date, today)}`);
    }
    const text = selectPassages(source.body ?? source.excerpt, terms, PASSAGE_BUDGET);
    if (text) {
      parts.push(text);
    }
    return parts.join("\n");
  });

  const listed = catalog.map((source, index) => {
    const parts = [`[${ranked.length + index + 1}] ${source.title}`, source.href];
    if (source.date) {
      parts.push(describeDate(source.date, today));
    }
    if (source.tags.length > 0) {
      parts.push(`tags: ${source.tags.join(", ")}`);
    }
    const summary = summarize(source.excerpt);
    if (summary) {
      parts.push(summary);
    }
    return parts.join(" | ");
  });

  const blocks = [detailed.join("\n\n")];
  if (listed.length > 0) {
    blocks.push(`More work on the site, newest first:\n${listed.join("\n")}`);
  }
  const context = blocks.filter(Boolean).join("\n\n");

  return [
    { role: "system", content: systemPrompt(today) },
    {
      role: "user",
      content: `SOURCES:\n${context || "(no matching content)"}\n\nQUESTION: ${question.slice(0, MAX_QUESTION_LENGTH)}`,
    },
  ];
}

function systemPrompt(today: string): string {
  return [
    "You are the assistant embedded in Domenik's portfolio site.",
    `Today is ${today}.`,
    "Answer questions about the work, projects, and pages listed in the SOURCES block.",
    "SOURCES opens with the best matches for the question, quoted with their text, then lists the rest of the work on the site, one line each, newest first.",
    "Rules:",
    "- Use only the SOURCES. Never invent projects, dates, clients, or links.",
    "- A date after today marks upcoming work that is not released yet. Asked for the latest or newest work, name the newest released one, and mention upcoming work separately as upcoming.",
    "- If the sources do not cover the question, say so plainly and suggest what is there.",
    "- Cite the sources you used as numbers in plain ASCII square brackets, e.g. [1] or [1][3].",
    "- Plain text only: no markdown, no bold, no lists, no headings.",
    "- Answer in at most three short sentences. No preamble, no sign-off.",
    "- Reply in the language the question was asked in.",
  ].join("\n");
}

function describeDate(date: string, today: string): string {
  const day = date.slice(0, 10);
  return day > today ? `${day} (upcoming, not released yet)` : day;
}

function summarize(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= SUMMARY_LENGTH) {
    return flat;
  }
  const cut = flat.slice(0, SUMMARY_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > SUMMARY_LENGTH / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
