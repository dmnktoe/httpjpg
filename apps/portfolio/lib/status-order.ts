export interface OrderedStatusLine {
  isLive: boolean;
  date: string | null;
}

function rank(line: OrderedStatusLine): number {
  if (line.isLive) {
    return 0;
  }
  return line.date && !Number.isNaN(Date.parse(line.date)) ? 1 : 2;
}

export function orderStatusLines<T extends OrderedStatusLine>(lines: T[]): T[] {
  return lines
    .map((line, index) => ({ line, index, rank: rank(line) }))
    .sort((a, b) => {
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }
      if (a.rank === 1) {
        const delta = Date.parse(b.line.date ?? "") - Date.parse(a.line.date ?? "");
        if (delta !== 0) {
          return delta;
        }
      }
      return a.index - b.index;
    })
    .map(({ line }) => line);
}
