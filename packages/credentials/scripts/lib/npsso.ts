export function parseNpsso(input: string): string | null {
  const trimmed = input.trim().replace(/^["']|["']$/g, "");
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as { npsso?: unknown };
      return typeof parsed.npsso === "string" && parsed.npsso ? parsed.npsso : null;
    } catch {
      return null;
    }
  }

  return trimmed;
}
