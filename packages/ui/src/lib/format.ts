export function formatYear(date?: string): string | null {
  if (!date) {
    return null;
  }
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getUTCFullYear().toString();
}
