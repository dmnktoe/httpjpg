"use client";

import { useState } from "react";
import { css } from "styled-system/css";

import { AssetPicker, StoryPicker } from "./asset-picker";
import {
  ALIGN_SELF_OPTIONS,
  blokPlugin,
  type BuilderItem,
  effectiveH,
  effectiveHidden,
  effectiveW,
  effectiveX,
  effectiveY,
  type FieldDef,
  GRID_COLS,
  GRID_SPAN_OPTIONS,
  hiddenFieldForViewport,
  type ItemSpacing,
  JUSTIFY_SELF_OPTIONS,
  SPACING_OPTIONS,
  type SpacingSet,
  type SpacingSide,
  type Viewport,
} from "./lib";

interface InspectorProps {
  item: BuilderItem | null;
  viewport: Viewport;
  onChange(patch: Partial<BuilderItem>): void;
  onDataChange(key: string, value: unknown): void;
}

const VIEWPORT_LABEL: Record<Viewport, string> = {
  base: "mobile",
  md: "tablet",
  lg: "desktop",
};

export function Inspector({ item, viewport, onChange, onDataChange }: InspectorProps) {
  return (
    <aside
      className={css({
        flexShrink: 0,
        width: "260px",
        padding: 3,
        fontFamily: "mono",
        fontSize: "sm",
        borderColor: "pageBorder",
        borderLeft: "1px solid",
        overflowY: "auto",
      })}
    >
      <h2
        className={css({
          mb: 3,
          fontSize: "sm",
          fontWeight: "bold",
          letterSpacing: "wide",
          textTransform: "uppercase",
        })}
      >
        Inspector
      </h2>
      {!item && (
        <p className={css({ opacity: 0.6 })}>
          Select an item on the canvas to edit its props, or drop a block from the palette.
        </p>
      )}
      {item && (
        <InspectorBody
          item={item}
          viewport={viewport}
          onChange={onChange}
          onDataChange={onDataChange}
        />
      )}
    </aside>
  );
}

interface InspectorBodyProps {
  item: BuilderItem;
  viewport: Viewport;
  onChange(patch: Partial<BuilderItem>): void;
  onDataChange(key: string, value: unknown): void;
}

function InspectorBody({ item, viewport, onChange, onDataChange }: InspectorBodyProps) {
  const def = blokPlugin(item.type);
  const w = effectiveW(item, viewport);
  const h = effectiveH(item, viewport);
  const x = effectiveX(item, viewport);
  const y = effectiveY(item, viewport);
  const wField = wFieldForViewport(viewport);
  const hField = hFieldForViewport(viewport);
  const xField = xFieldForViewport(viewport);
  const yField = yFieldForViewport(viewport);
  const ownSpacing = item.spacing[viewport];
  const inheritedSpacing = inheritedSpacingForViewport(item.spacing, viewport);
  const hidden = effectiveHidden(item, viewport);
  const hiddenField = hiddenFieldForViewport(viewport);

  const setSpacing = (side: SpacingSide, value: string) => {
    const next: ItemSpacing = {
      base: { ...item.spacing.base },
      md: { ...item.spacing.md },
      lg: { ...item.spacing.lg },
    };
    if (!value) {
      delete next[viewport][side];
    } else {
      next[viewport][side] = value;
    }
    onChange({ spacing: next });
  };

  const writeSize = (key: "w" | "h", value: number | undefined) => {
    const patch: Partial<BuilderItem> = {};
    if (key === "w") {
      patch[wField] = value;
    } else {
      patch[hField] = value;
    }
    // Base values are required; never clear them.
    if (viewport === "base") {
      if (value == null) return;
    }
    onChange(patch);
  };

  const writePosition = (key: "x" | "y", value: number | undefined) => {
    const patch: Partial<BuilderItem> = {};
    if (key === "x") {
      patch[xField] = value;
    } else {
      patch[yField] = value;
    }
    if (viewport === "base" && value == null) return;
    onChange(patch);
  };

  const ownPos = (axis: "x" | "y"): number => {
    const value =
      viewport === "lg"
        ? axis === "x"
          ? item.xLg
          : item.yLg
        : viewport === "md"
          ? axis === "x"
            ? item.xMd
            : item.yMd
          : axis === "x"
            ? item.x
            : item.y;
    return value != null ? value + 1 : 0;
  };

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: 3 })}>
      <Group label="Block">
        <Row label="Type" value={def?.label ?? item.type} />
        <Row label="UID" value={item.id} mono />
        <Row label="Editing" value={VIEWPORT_LABEL[viewport]} />
      </Group>

      <Group label={`Position · ${VIEWPORT_LABEL[viewport]}`}>
        {viewport !== "base" && (
          <Hint>Empty value inherits from {viewport === "lg" ? "tablet / mobile" : "mobile"}.</Hint>
        )}
        <NumberField
          label="Col Start"
          value={ownPos("x")}
          min={viewport === "base" ? 1 : 0}
          max={GRID_COLS}
          onChange={(v) =>
            writePosition("x", v > 0 ? Math.max(0, v - 1) : viewport === "base" ? 0 : undefined)
          }
        />
        <NumberField
          label="Row Start"
          value={ownPos("y")}
          min={viewport === "base" ? 1 : 0}
          onChange={(v) =>
            writePosition("y", v > 0 ? Math.max(0, v - 1) : viewport === "base" ? 0 : undefined)
          }
        />
        <Row label="Effective" value={`col ${x + 1} · row ${y + 1}`} />
      </Group>

      <Group label={`Span · ${VIEWPORT_LABEL[viewport]}`}>
        {viewport !== "base" && (
          <Hint>Empty value inherits from {viewport === "lg" ? "tablet / mobile" : "mobile"}.</Hint>
        )}
        <SelectField
          label="Col Span"
          value={ownSpan(item, viewport, "w")}
          options={GRID_SPAN_OPTIONS}
          onChange={(v) =>
            writeSize("w", v === "" ? undefined : v === "full" ? GRID_COLS : Number(v))
          }
        />
        <SelectField
          label="Row Span"
          value={ownSpan(item, viewport, "h")}
          options={GRID_SPAN_OPTIONS}
          onChange={(v) =>
            writeSize("h", v === "" ? undefined : v === "full" ? GRID_COLS : Number(v))
          }
        />
        <Row label="Effective" value={`${w} × ${h}`} />
      </Group>

      <Group label={`Visibility · ${VIEWPORT_LABEL[viewport]}`}>
        <label className={css({ display: "flex", alignItems: "center", gap: 2 })}>
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => onChange({ [hiddenField]: e.target.checked || undefined })}
          />
          <span>Hide on {VIEWPORT_LABEL[viewport]}</span>
        </label>
      </Group>

      <Group label="Grid Item">
        <Hint>Alignment is the same across all breakpoints.</Hint>
        <SelectField
          label="Align Self"
          value={item.alignSelf ?? ""}
          options={ALIGN_SELF_OPTIONS}
          onChange={(v) => onChange({ alignSelf: v || undefined })}
        />
        <SelectField
          label="Justify Self"
          value={item.justifySelf ?? ""}
          options={JUSTIFY_SELF_OPTIONS}
          onChange={(v) => onChange({ justifySelf: v || undefined })}
        />
      </Group>

      <Group label={`Spacing · ${VIEWPORT_LABEL[viewport]}`}>
        {viewport !== "base" && (
          <Hint>Empty value inherits from {viewport === "lg" ? "tablet / mobile" : "mobile"}.</Hint>
        )}
        <SpacingPair
          legend="Margin"
          ownSet={ownSpacing}
          inherited={inheritedSpacing}
          prefix="m"
          onChange={setSpacing}
        />
        <SpacingPair
          legend="Padding"
          ownSet={ownSpacing}
          inherited={inheritedSpacing}
          prefix="p"
          onChange={setSpacing}
        />
      </Group>

      {def && def.fields.length > 0 && (
        <Group label="Content">
          {def.fields.map((field) => (
            <BlokField
              key={field.key}
              field={field}
              value={item.data[field.key]}
              onChange={(v) => onDataChange(field.key, v)}
            />
          ))}
        </Group>
      )}
    </div>
  );
}

function wFieldForViewport(v: Viewport): "w" | "wMd" | "wLg" {
  if (v === "lg") return "wLg";
  if (v === "md") return "wMd";
  return "w";
}

function hFieldForViewport(v: Viewport): "h" | "hMd" | "hLg" {
  if (v === "lg") return "hLg";
  if (v === "md") return "hMd";
  return "h";
}

function xFieldForViewport(v: Viewport): "x" | "xMd" | "xLg" {
  if (v === "lg") return "xLg";
  if (v === "md") return "xMd";
  return "x";
}

function yFieldForViewport(v: Viewport): "y" | "yMd" | "yLg" {
  if (v === "lg") return "yLg";
  if (v === "md") return "yMd";
  return "y";
}

function ownSpan(item: BuilderItem, viewport: Viewport, axis: "w" | "h"): string {
  const value =
    viewport === "lg"
      ? axis === "w"
        ? item.wLg
        : item.hLg
      : viewport === "md"
        ? axis === "w"
          ? item.wMd
          : item.hMd
        : axis === "w"
          ? item.w
          : item.h;
  if (value == null) return "";
  if (axis === "w" && value === GRID_COLS) return "full";
  return String(value);
}

function inheritedSpacingForViewport(spacing: ItemSpacing, viewport: Viewport): SpacingSet {
  if (viewport === "lg") return { ...spacing.base, ...spacing.md };
  if (viewport === "md") return { ...spacing.base };
  return {};
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 2,
        border: "1px solid",
        borderColor: "pageBorder",
      })}
    >
      <h3
        className={css({
          opacity: 0.6,
          fontSize: "sm",
          letterSpacing: "wide",
          textTransform: "uppercase",
        })}
      >
        {label}
      </h3>
      {children}
    </section>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className={css({ opacity: 0.5, fontSize: "sm" })}>{children}</p>;
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className={css({ display: "flex", justifyContent: "space-between", gap: 2 })}>
      <span className={css({ opacity: 0.6 })}>{label}</span>
      <span
        className={css({
          fontFamily: mono ? "mono" : undefined,
          textAlign: "right",
          wordBreak: "break-all",
        })}
      >
        {value}
      </span>
    </div>
  );
}

const labelCss = css({ display: "flex", flexDirection: "column", gap: 1 });
const fieldInline = {
  padding: 1,
  border: "1px solid",
  borderColor: "pageBorder",
  bg: "pageBg",
  color: "pageFg",
  fontFamily: "mono",
  fontSize: "sm",
} as const;
const fieldCss = css({ width: "100%", ...fieldInline });

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange(v: number): void;
}) {
  return (
    <label className={labelCss}>
      <span className={css({ opacity: 0.6 })}>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
        className={fieldCss}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange(v: string): void;
  hint?: string;
}) {
  return (
    <label className={labelCss}>
      <span className={css({ display: "flex", justifyContent: "space-between", opacity: 0.6 })}>
        <span>{label}</span>
        {hint && <span className={css({ opacity: 0.6 })}>{hint}</span>}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldCss}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const SIDE_ROWS: { label: string; sides: [SpacingSide, SpacingSide] }[] = [
  { label: "Top / Bottom", sides: ["mt", "mb"] },
  { label: "Left / Right", sides: ["ml", "mr"] },
];

function SpacingPair({
  legend,
  ownSet,
  inherited,
  prefix,
  onChange,
}: {
  legend: string;
  ownSet: SpacingSet;
  inherited: SpacingSet;
  prefix: "m" | "p";
  onChange(side: SpacingSide, value: string): void;
}) {
  return (
    <fieldset
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: 1,
        padding: 2,
        border: "1px solid",
        borderColor: "pageBorder",
      })}
    >
      <legend className={css({ opacity: 0.6, fontSize: "sm", textTransform: "uppercase" })}>
        {legend}
      </legend>
      {SIDE_ROWS.map(({ label, sides }) => {
        const [a, b] = sides.map((s) => `${prefix}${s.slice(1)}` as SpacingSide) as [
          SpacingSide,
          SpacingSide,
        ];
        return (
          <div
            key={label}
            className={css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 })}
          >
            <SpacingField side={a} ownSet={ownSet} inherited={inherited} onChange={onChange} />
            <SpacingField side={b} ownSet={ownSet} inherited={inherited} onChange={onChange} />
          </div>
        );
      })}
    </fieldset>
  );
}

function SpacingField({
  side,
  ownSet,
  inherited,
  onChange,
}: {
  side: SpacingSide;
  ownSet: SpacingSet;
  inherited: SpacingSet;
  onChange(side: SpacingSide, value: string): void;
}) {
  const own = ownSet[side] ?? "";
  const inheritedValue = inherited[side];
  const hint = !own && inheritedValue ? `↑ ${inheritedValue}` : undefined;
  return (
    <SelectField
      label={SIDE_LABEL[side]}
      value={own}
      options={SPACING_OPTIONS}
      onChange={(v) => onChange(side, v)}
      hint={hint}
    />
  );
}

const SIDE_LABEL: Record<SpacingSide, string> = {
  mt: "Top",
  mb: "Bottom",
  ml: "Left",
  mr: "Right",
  pt: "Top",
  pb: "Bottom",
  pl: "Left",
  pr: "Right",
};

function BlokField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange(v: unknown): void;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <label className={labelCss}>
          <span className={css({ opacity: 0.6 })}>{field.label}</span>
          <textarea
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className={fieldCss}
          />
        </label>
      );
    case "number":
      return (
        <label className={labelCss}>
          <span className={css({ opacity: 0.6 })}>{field.label}</span>
          <input
            type="number"
            value={Number(value ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
            className={fieldCss}
          />
        </label>
      );
    case "boolean":
      return (
        <label className={css({ display: "flex", alignItems: "center", gap: 2 })}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{field.label}</span>
        </label>
      );
    case "select":
      return (
        <SelectField
          label={field.label}
          value={String(value ?? "")}
          options={field.options ?? []}
          onChange={onChange}
        />
      );
    case "assetUrl":
      return <PickableField field={field} value={value} onChange={onChange} kind="asset" />;
    case "storyUuid":
      return <PickableField field={field} value={value} onChange={onChange} kind="story" />;
    case "text":
    default:
      return (
        <label className={labelCss}>
          <span className={css({ opacity: 0.6 })}>{field.label}</span>
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={fieldCss}
          />
        </label>
      );
  }
}

function PickableField({
  field,
  value,
  onChange,
  kind,
}: {
  field: FieldDef;
  value: unknown;
  onChange(v: unknown): void;
  kind: "asset" | "story";
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <label className={labelCss}>
      <span className={css({ opacity: 0.6 })}>{field.label}</span>
      <div className={css({ display: "flex", gap: 1 })}>
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={kind === "asset" ? "https://..." : "uuid"}
          className={css({ flex: 1, ...fieldInline })}
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={css({
            padding: "1px 8px",
            color: "pageFg",
            fontFamily: "mono",
            fontSize: "sm",
            bg: "pageBg",
            border: "1px solid",
            borderColor: "pageBorder",
            cursor: "pointer",
            _hover: { color: "pageBg", bg: "pageFg" },
          })}
        >
          Browse
        </button>
      </div>
      {kind === "asset" && (
        <AssetPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onPick={(asset) => {
            onChange(asset.filename);
            setPickerOpen(false);
          }}
        />
      )}
      {kind === "story" && (
        <StoryPicker
          open={pickerOpen}
          startsWith={field.storyStartsWith}
          onClose={() => setPickerOpen(false)}
          onPick={(story) => {
            onChange(story.uuid);
            setPickerOpen(false);
          }}
        />
      )}
    </label>
  );
}
