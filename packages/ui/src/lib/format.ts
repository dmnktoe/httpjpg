export function formatYear(date?: string): string | null {
  return date ? new Date(date).getFullYear().toString() : null;
}
