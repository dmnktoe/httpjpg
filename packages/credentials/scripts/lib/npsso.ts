/**
 * Accept whatever the user pasted: the bare cookie, or the whole
 * `{"npsso":"…"}` body that Sony's ssocookie endpoint renders in the browser.
 */
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
