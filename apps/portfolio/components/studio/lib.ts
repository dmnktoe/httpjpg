import { blokPlugin } from "./bloks";

export { BLOK_REGISTRY, type BlokPlugin, blokPlugin } from "./bloks";
export type { FieldDef, FieldType } from "./bloks";

export const GRID_COLS = 12;
export const ROW_HEIGHT_PX = 40;
export const MIN_ROWS = 30;

export type Viewport = "base" | "md" | "lg";

export const VIEWPORT_WIDTH_PX: Record<Viewport, number | null> = {
  base: 390,
  md: 768,
  lg: null,
};

export const SPACING_SIDES = ["mt", "mb", "ml", "mr", "pt", "pb", "pl", "pr"] as const;
export type SpacingSide = (typeof SPACING_SIDES)[number];

export type SpacingSet = Partial<Record<SpacingSide, string>>;

export interface ItemSpacing {
  base: SpacingSet;
  md: SpacingSet;
  lg: SpacingSet;
}

export interface BuilderItem {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  wMd?: number;
  wLg?: number;
  hMd?: number;
  hLg?: number;
  spacing: ItemSpacing;
  alignSelf?: string;
  justifySelf?: string;
  data: Record<string, unknown>;
}

export function emptySpacing(): ItemSpacing {
  return { base: {}, md: {}, lg: {} };
}

export function effectiveSpacing(item: BuilderItem, viewport: Viewport): SpacingSet {
  const { base, md, lg } = item.spacing;
  if (viewport === "lg") return { ...base, ...md, ...lg };
  if (viewport === "md") return { ...base, ...md };
  return { ...base };
}

export interface GridSettings {
  columns: number;
  columnsMd?: number;
  columnsLg?: number;
  gap: string;
}

export function effectiveColumns(settings: GridSettings, viewport: Viewport): number {
  if (viewport === "lg") return settings.columnsLg ?? settings.columnsMd ?? settings.columns;
  if (viewport === "md") return settings.columnsMd ?? settings.columns;
  return settings.columns;
}

export function effectiveW(item: BuilderItem, viewport: Viewport): number {
  if (viewport === "lg") return item.wLg ?? item.wMd ?? item.w;
  if (viewport === "md") return item.wMd ?? item.w;
  return item.w;
}

export function effectiveH(item: BuilderItem, viewport: Viewport): number {
  if (viewport === "lg") return item.hLg ?? item.hMd ?? item.h;
  if (viewport === "md") return item.hMd ?? item.h;
  return item.h;
}

export function patchSize(viewport: Viewport, w: number, h: number): Partial<BuilderItem> {
  if (viewport === "lg") return { wLg: w, hLg: h };
  if (viewport === "md") return { wMd: w, hMd: h };
  return { w, h };
}

export const ALIGN_SELF_OPTIONS = [
  { value: "", label: "—" },
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
  { value: "stretch", label: "Stretch" },
];

export const SPACING_OPTIONS = [
  { value: "", label: "—" },
  { value: "0", label: "0" },
  { value: "1", label: "1 (4px)" },
  { value: "2", label: "2 (8px)" },
  { value: "3", label: "3 (12px)" },
  { value: "4", label: "4 (16px)" },
  { value: "6", label: "6 (24px)" },
  { value: "8", label: "8 (32px)" },
  { value: "12", label: "12 (48px)" },
];

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const BREAKPOINT_SUFFIX: Record<keyof ItemSpacing, string> = {
  base: "",
  md: "Md",
  lg: "Lg",
};

function withSpacing(blok: Record<string, unknown>, item: BuilderItem): Record<string, unknown> {
  const out: Record<string, unknown> = { ...blok };
  for (const breakpoint of ["base", "md", "lg"] as const) {
    const set = item.spacing[breakpoint];
    const suffix = BREAKPOINT_SUFFIX[breakpoint];
    for (const side of SPACING_SIDES) {
      const v = set[side];
      if (v) out[`${side}${suffix}`] = v;
    }
  }
  return out;
}

function readSpacing(blok: Record<string, unknown>): ItemSpacing {
  const spacing = emptySpacing();
  for (const breakpoint of ["base", "md", "lg"] as const) {
    const suffix = BREAKPOINT_SUFFIX[breakpoint];
    for (const side of SPACING_SIDES) {
      const raw = blok[`${side}${suffix}`];
      if (raw != null && raw !== "") {
        spacing[breakpoint][side] = String(raw);
      }
    }
  }
  return spacing;
}

export interface ExportedGrid {
  component: "grid";
  _uid: string;
  columns: string;
  columnsMd?: string;
  columnsLg?: string;
  gap?: string;
  items: ExportedGridItem[];
}

export interface ExportedGridItem {
  component: "grid_item";
  _uid: string;
  colStart: number;
  rowStart: number;
  colSpan: string;
  colSpanMd?: string;
  colSpanLg?: string;
  rowSpan: number;
  rowSpanMd?: number;
  rowSpanLg?: number;
  alignSelf?: string;
  justifySelf?: string;
  content: ExportedBlok[];
}

export interface ExportedBlok {
  component: string;
  _uid: string;
  [key: string]: unknown;
}

export function serializeGrid(settings: GridSettings, items: BuilderItem[]): ExportedGrid {
  const cols = String(settings.columns);
  return {
    component: "grid",
    _uid: uuid(),
    columns: cols,
    columnsMd: settings.columnsMd ? String(settings.columnsMd) : cols,
    columnsLg: settings.columnsLg ? String(settings.columnsLg) : cols,
    gap: settings.gap || undefined,
    items: items
      .slice()
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map<ExportedGridItem>((it) => {
        const plugin = blokPlugin(it.type);
        const serialized = plugin ? plugin.serialize(it.data) : { ...it.data };
        const child = withSpacing(
          { component: it.type, _uid: uuid(), ...serialized },
          it,
        ) as ExportedBlok;
        return {
          component: "grid_item",
          _uid: uuid(),
          colStart: it.x + 1,
          rowStart: it.y + 1,
          colSpan: String(it.w),
          colSpanMd: it.wMd ? String(it.wMd) : undefined,
          colSpanLg: it.wLg ? String(it.wLg) : undefined,
          rowSpan: it.h,
          rowSpanMd: it.hMd,
          rowSpanLg: it.hLg,
          alignSelf: it.alignSelf || undefined,
          justifySelf: it.justifySelf || undefined,
          content: [child],
        };
      }),
  };
}

function parseSpan(value: unknown, fallback: number): number {
  if (value == null || value === "") return fallback;
  if (value === "full") return GRID_COLS;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function optionalSpan(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  if (value === "full") return GRID_COLS;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function str(v: unknown): string | undefined {
  if (v == null || v === "") return undefined;
  return String(v);
}

function asInt(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function deserializeGrid(grid: ExportedGrid): {
  settings: GridSettings;
  items: BuilderItem[];
} {
  const settings: GridSettings = {
    columns: parseSpan(grid.columns, GRID_COLS),
    columnsMd: grid.columnsMd ? parseSpan(grid.columnsMd, GRID_COLS) : undefined,
    columnsLg: grid.columnsLg ? parseSpan(grid.columnsLg, GRID_COLS) : undefined,
    gap: grid.gap ?? "",
  };

  const flowCols = settings.columnsLg ?? settings.columnsMd ?? settings.columns;

  // Track auto-flow cursor for items without explicit colStart/rowStart.
  let cursorX = 0;
  let cursorY = 0;
  let rowMaxH = 1;

  const items: BuilderItem[] = (grid.items ?? []).map((gi) => {
    const inner = gi.content?.[0] ?? { component: "missing", _uid: "" };
    const plugin = blokPlugin(inner.component);
    const data = plugin ? plugin.deserialize(inner) : { ...inner };

    const w = parseSpan(gi.colSpan, plugin?.defaultSize.w ?? 1);
    const h = typeof gi.rowSpan === "number" ? gi.rowSpan : Number(gi.rowSpan ?? 0) || 1;

    const explicitX = asInt(gi.colStart);
    const explicitY = asInt(gi.rowStart);

    let x: number;
    let y: number;
    if (explicitX != null || explicitY != null) {
      x = Math.max(0, (explicitX ?? 1) - 1);
      y = Math.max(0, (explicitY ?? 1) - 1);
    } else {
      const fitW = Math.min(w, flowCols);
      if (cursorX + fitW > flowCols) {
        cursorX = 0;
        cursorY += rowMaxH;
        rowMaxH = 1;
      }
      x = cursorX;
      y = cursorY;
      cursorX += fitW;
      rowMaxH = Math.max(rowMaxH, h);
    }

    return {
      id: createItemId(),
      type: inner.component,
      x,
      y,
      w,
      h,
      wMd: optionalSpan(gi.colSpanMd),
      wLg: optionalSpan(gi.colSpanLg),
      hMd: gi.rowSpanMd && gi.rowSpanMd > 0 ? gi.rowSpanMd : undefined,
      hLg: gi.rowSpanLg && gi.rowSpanLg > 0 ? gi.rowSpanLg : undefined,
      spacing: readSpacing(inner as Record<string, unknown>),
      alignSelf: str(gi.alignSelf),
      justifySelf: str(gi.justifySelf),
      data,
    };
  });

  return { settings, items };
}

export function findGridsInBody(body: unknown): ExportedGrid[] {
  if (!Array.isArray(body)) return [];
  return (body as Array<{ component?: string }>).filter(
    (entry): entry is ExportedGrid => entry?.component === "grid",
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createItemId(): string {
  return `item-${Math.random().toString(36).slice(2, 10)}`;
}
