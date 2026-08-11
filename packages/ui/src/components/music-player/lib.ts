export function formatTime(time: number): string {
  const safe = Number.isFinite(time) && time > 0 ? time : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = Math.floor(safe % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

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
