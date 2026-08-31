const WALL_CLOCK_YEAR = /^(\d{4})-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?$/;

/**
 * Digit lookalikes, indexed by the digit they stand in for. Purely decorative —
 * a screen reader would read most of them as punctuation or a Coptic letter, so
 * anything rendering these has to keep the plain number in the accessible name.
 */
const GLYPH_DIGITS = ["⊘", "𝟙", "ϩ", "Ӡ", "५", "Ƽ", "Ϭ", "7", "𝟠", "९"] as const;

export function formatGlyphDigits(value: number): string {
  return value.toString().replace(/\d/g, (digit) => GLYPH_DIGITS[Number(digit)]);
}

export function formatYear(date?: string): string | null {
  if (!date) {
    return null;
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const wallClock = WALL_CLOCK_YEAR.exec(date);
  return wallClock ? wallClock[1] : parsed.getUTCFullYear().toString();
}

export function formatTime(time: number): string {
  const safe = Number.isFinite(time) && time > 0 ? time : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = Math.floor(safe % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
