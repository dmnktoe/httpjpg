export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "auto";

/** `minmax(0, 1fr)`, not `1fr`: a wide child must not stretch its track past the grid. */
export function gridTemplate(columns: GridColumns): string {
  return columns === "auto"
    ? "repeat(auto-fit, minmax(200px, 1fr))"
    : `repeat(${columns}, minmax(0, 1fr))`;
}

/** One axis of a grid item at one breakpoint: grid lines plus a span. */
export interface GridTrack {
  start?: number;
  end?: number;
  span?: number | "full";
}

/**
 * The track a larger breakpoint ends up with. Whatever it doesn't set carries
 * over from the breakpoint below — a new start keeps the width, a new span keeps
 * the start — so placement cascades the way spacing does.
 */
export function carryTrack(below: GridTrack, own: GridTrack): GridTrack {
  if (own.start === undefined && own.end === undefined && own.span === undefined) {
    return below;
  }
  const width =
    below.start !== undefined && below.end !== undefined ? below.end - below.start : below.span;
  return {
    start: own.start ?? below.start,
    end: own.end,
    span: own.span ?? (own.end === undefined ? width : undefined),
  };
}

/** `grid-column` / `grid-row` value for a track; an explicit end wins over the span. */
export function trackLine({ start, end, span }: GridTrack): string {
  if (span === "full") {
    return `${start ?? 1} / -1`;
  }
  const to = end !== undefined ? `${end}` : span ? `span ${span}` : undefined;
  if (start !== undefined) {
    return to ? `${start} / ${to}` : `${start}`;
  }
  if (end !== undefined) {
    return `auto / ${end}`;
  }
  return to ?? "auto";
}
