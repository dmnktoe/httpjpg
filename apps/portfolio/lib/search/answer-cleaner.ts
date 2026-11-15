const WIDE_CITATION = /[【［]\s*(\d+(?:\s*[,，、]\s*\d+)*)\s*(?:†[^】］]*)?[】］]/g;

const BOLD = /\*\*/g;

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
  push: (delta: string) => string;
  flush: () => string;
}

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
