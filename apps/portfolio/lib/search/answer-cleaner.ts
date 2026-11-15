/**
 * gpt-oss cites in its own house style — `【2】`, `【2†L4-L9】`, `［2］` — and
 * bolds names with markdown, whatever the prompt says. Neither client renders
 * markdown, and both, like `firstCitedSource`, read citations as ASCII `[n]`:
 * left alone, the answer shows `**…**` and loses its source chips and its
 * "go to" action. Cleaning here fixes every client, released app builds
 * included.
 */

/** A full-width citation: numbers, then optional `†…` location noise. */
const WIDE_CITATION = /[【［]\s*(\d+(?:\s*[,，、]\s*\d+)*)\s*(?:†[^】］]*)?[】］]/g;

const BOLD = /\*\*/g;

/** Longest a citation can run before it is treated as plain text. */
const MAX_PENDING = 48;

export function cleanAnswerText(text: string): string {
  return text
    .replace(WIDE_CITATION, (_, numbers: string) =>
      numbers
        .split(/\s*[,，、]\s*/)
        .map((number) => `[${number}]`)
        .join(""),
    )
    .replace(BOLD, "");
}

interface AnswerCleaner {
  /** Cleaned text that is safe to send now; may be empty. */
  push: (delta: string) => string;
  /** Whatever was held back, once the stream ends. */
  flush: () => string;
}

/**
 * Cleans a streamed answer. A delta can end halfway through a citation or
 * between the two `*` of a bold marker, so that tail is held back until the
 * next delta completes it.
 */
export function createAnswerCleaner(): AnswerCleaner {
  let pending = "";

  return {
    push(delta) {
      pending += delta;
      const cut = safeLength(pending);
      const ready = pending.slice(0, cut);
      pending = pending.slice(cut);
      return cleanAnswerText(ready);
    },
    flush() {
      const rest = cleanAnswerText(pending);
      pending = "";
      return rest;
    },
  };
}

/** How much of `text` cannot change with more input. */
function safeLength(text: string): number {
  let cut = text.length;

  const open = Math.max(text.lastIndexOf("【"), text.lastIndexOf("［"));
  if (open !== -1 && !/[】］]/.test(text.slice(open)) && text.length - open <= MAX_PENDING) {
    cut = open;
  }

  if (cut === text.length) {
    while (cut > 0 && text[cut - 1] === "*") {
      cut -= 1;
    }
  }
  return cut;
}
