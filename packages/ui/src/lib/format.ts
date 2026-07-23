export function formatYear(date?: string): string | null {
  if (!date) {
    return null;
  }
  const parsed = new Date(date);
  // UTC so a date-only string ("2024-06-12") can't shift a year in negative offsets.
  return Number.isNaN(parsed.getTime()) ? null : parsed.getUTCFullYear().toString();
}
