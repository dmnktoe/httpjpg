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
 * the start — so placement cascades the way spacing does. `"full"` always starts
 * at line 1 unless the breakpoint sets its own start.
 */
export function carryTrack(below: GridTrack, own: GridTrack): GridTrack {
  if (own.start === undefined && own.end === undefined && own.span === undefined) {
    return below;
  }
  if (own.span === "full") {
    return { start: own.start, end: own.end, span: "full" };
  }
  const start = own.start ?? below.start;
  if (own.end !== undefined || own.span !== undefined) {
    return { start, end: own.end, span: own.span };
  }
  // Only the start moved: keep the width when it is known, else keep the end line.
  if (below.end === undefined) {
    return { start, span: below.span };
  }
  // Negative lines count from the far edge, so a width is only measurable between two positive ones.
  if (below.start !== undefined && below.start > 0 && below.end > below.start) {
    return { start, span: below.end - below.start };
  }
  return { start, end: below.end };
}

/** `grid-column` / `grid-row` value for a track; an explicit end wins over the span. */
export function trackLine({ start, end, span }: GridTrack): string {
  if (end !== undefined) {
    const from = start ?? (span === "full" ? 1 : span ? `span ${span}` : "auto");
    return `${from} / ${end}`;
  }
  if (span === "full") {
    return `${start ?? 1} / -1`;
  }
  if (start !== undefined) {
    return span ? `${start} / span ${span}` : `${start}`;
  }
  return span ? `span ${span}` : "auto";
}
