const STORYBLOK_DATE = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/;

export function storyblokToLocalInput(value: string): string {
  const match = STORYBLOK_DATE.exec(value);
  if (!match) {
    return "";
  }
  const [, year, month, day, hour, minute] = match.map(Number) as [
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  return toLocalInput(new Date(Date.UTC(year, month - 1, day, hour, minute)));
}

export function toLocalInput(date: Date): string {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function localInputToIso(value: string): string | undefined {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined;
}
