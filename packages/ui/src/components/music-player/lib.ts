export { formatTime } from "../../lib/format";

export function truncate(text: string, maxLength: number): string {
  const characters = Array.from(text);
  if (characters.length <= maxLength) {
    return text;
  }
  return `${characters
    .slice(0, Math.max(0, maxLength - 1))
    .join("")
    .trimEnd()}…`;
}
