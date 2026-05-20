export const GRID_COLS = 12;
export const ROW_HEIGHT_PX = 40;
export const MIN_ROWS = 30;

export type Viewport = "base" | "md" | "lg";

export const VIEWPORT_WIDTH_PX: Record<Viewport, number | null> = {
  base: 390,
  md: 768,
  lg: null,
};

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
  mt?: string;
  mb?: string;
  ml?: string;
  mr?: string;
  alignSelf?: string;
  justifySelf?: string;
  data: Record<string, unknown>;
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

export interface GridSettings {
  columns: number;
  columnsMd?: number;
  columnsLg?: number;
  gap: string;
}

export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "assetUrl";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
}

export interface BlokDef {
  type: string;
  label: string;
  group: string;
  defaultSize: { w: number; h: number };
  defaults: Record<string, unknown>;
  fields: FieldDef[];
}

const TEXT_ALIGN_OPTIONS = [
  { value: "", label: "—" },
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const BUTTON_VARIANTS = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "outline", label: "Outline" },
  { value: "disabled", label: "Disabled" },
];

const BUTTON_SIZES = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

const HEADLINE_LEVELS = [
  { value: "1", label: "H1" },
  { value: "2", label: "H2" },
  { value: "3", label: "H3" },
];

const VIDEO_SOURCES = [
  { value: "native", label: "Native" },
  { value: "youtube", label: "YouTube" },
  { value: "vimeo", label: "Vimeo" },
];

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

export const BLOK_CATALOG: BlokDef[] = [
  {
    type: "headline",
    label: "Headline",
    group: "Content",
    defaultSize: { w: 12, h: 2 },
    defaults: { text: "Headline", level: "2" },
    fields: [
      { key: "text", label: "Text", type: "text" },
      { key: "level", label: "Level", type: "select", options: HEADLINE_LEVELS },
      { key: "align", label: "Align", type: "select", options: TEXT_ALIGN_OPTIONS },
    ],
  },
  {
    type: "paragraph",
    label: "Paragraph",
    group: "Content",
    defaultSize: { w: 6, h: 3 },
    defaults: { text: "Lorem ipsum dolor sit amet." },
    fields: [
      { key: "text", label: "Text", type: "textarea" },
      { key: "align", label: "Align", type: "select", options: TEXT_ALIGN_OPTIONS },
    ],
  },
  {
    type: "button",
    label: "Button",
    group: "Content",
    defaultSize: { w: 3, h: 2 },
    defaults: { text: "Click", variant: "primary", size: "md", type: "button" },
    fields: [
      { key: "text", label: "Text", type: "text" },
      { key: "variant", label: "Variant", type: "select", options: BUTTON_VARIANTS },
      { key: "size", label: "Size", type: "select", options: BUTTON_SIZES },
      { key: "linkUrl", label: "Link URL", type: "text" },
    ],
  },
  {
    type: "richtext",
    label: "Rich Text",
    group: "Content",
    defaultSize: { w: 8, h: 4 },
    defaults: { content: "" },
    fields: [{ key: "content", label: "Plain text (wrapped as richtext)", type: "textarea" }],
  },
  {
    type: "image",
    label: "Image",
    group: "Media",
    defaultSize: { w: 6, h: 4 },
    defaults: { imageUrl: "", alt: "" },
    fields: [
      { key: "imageUrl", label: "Image URL", type: "assetUrl" },
      { key: "alt", label: "Alt Text", type: "text" },
    ],
  },
  {
    type: "video",
    label: "Video",
    group: "Media",
    defaultSize: { w: 8, h: 5 },
    defaults: { videoUrl: "", source: "youtube" },
    fields: [
      { key: "videoUrl", label: "Video URL", type: "text" },
      { key: "source", label: "Source", type: "select", options: VIDEO_SOURCES },
    ],
  },
  {
    type: "slideshow",
    label: "Slideshow",
    group: "Media",
    defaultSize: { w: 12, h: 6 },
    defaults: {},
    fields: [],
  },
  {
    type: "marquee",
    label: "Marquee",
    group: "Media",
    defaultSize: { w: 12, h: 2 },
    defaults: { text: "Scrolling text" },
    fields: [{ key: "text", label: "Text", type: "text" }],
  },
  {
    type: "music_player",
    label: "Music Player",
    group: "Widgets",
    defaultSize: { w: 6, h: 4 },
    defaults: { spotifyUrl: "" },
    fields: [{ key: "spotifyUrl", label: "Spotify URL / ID", type: "text" }],
  },
  {
    type: "work_card",
    label: "Work Card",
    group: "Widgets",
    defaultSize: { w: 4, h: 5 },
    defaults: { workUuid: "" },
    fields: [{ key: "workUuid", label: "Work Story UUID", type: "text" }],
  },
  {
    type: "work_list",
    label: "Work List",
    group: "Widgets",
    defaultSize: { w: 12, h: 6 },
    defaults: {},
    fields: [],
  },
];

export function blokDef(type: string): BlokDef | undefined {
  return BLOK_CATALOG.find((b) => b.type === type);
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function serializeBlokData(type: string, data: Record<string, unknown>): Record<string, unknown> {
  switch (type) {
    case "image":
      return {
        image: data.imageUrl ? { filename: data.imageUrl, alt: data.alt ?? "" } : null,
        alt: data.alt ?? "",
      };
    case "button":
      return {
        text: data.text ?? "",
        variant: data.variant ?? "primary",
        size: data.size ?? "md",
        type: data.type ?? "button",
        link: data.linkUrl ? { url: data.linkUrl, linktype: "url" } : { linktype: "url" },
      };
    case "richtext":
      return {
        content: {
          type: "doc",
          content: data.content
            ? [{ type: "paragraph", content: [{ type: "text", text: String(data.content) }] }]
            : [],
        },
      };
    case "work_card":
      return { work: data.workUuid ?? "" };
    case "music_player":
      return { spotifyUrl: data.spotifyUrl ?? "" };
    case "marquee":
      return { text: data.text ?? "" };
    case "video":
      return { videoUrl: data.videoUrl ?? "", source: data.source ?? "native" };
    case "headline":
      return {
        text: data.text ?? "",
        level: data.level ?? "2",
        align: data.align ?? "",
      };
    case "paragraph":
      return {
        text: data.text ?? "",
        align: data.align ?? "",
      };
    default:
      return { ...data };
  }
}

function withSpacing(blok: Record<string, unknown>, item: BuilderItem): Record<string, unknown> {
  return {
    ...blok,
    ...(item.mt ? { mt: item.mt } : {}),
    ...(item.mb ? { mb: item.mb } : {}),
    ...(item.ml ? { ml: item.ml } : {}),
    ...(item.mr ? { mr: item.mr } : {}),
  };
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
        const child: ExportedBlok = withSpacing(
          {
            component: it.type,
            _uid: uuid(),
            ...serializeBlokData(it.type, it.data),
          },
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

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createItemId(): string {
  return `item-${Math.random().toString(36).slice(2, 10)}`;
}
