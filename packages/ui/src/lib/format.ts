const WALL_CLOCK_YEAR = /^(\d{4})-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?$/;

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
