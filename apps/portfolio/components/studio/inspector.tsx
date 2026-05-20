"use client";

import { css } from "styled-system/css";

import {
  ALIGN_SELF_OPTIONS,
  type BuilderItem,
  type FieldDef,
  GRID_COLS,
  SPACING_OPTIONS,
  blokDef,
} from "./lib";

interface InspectorProps {
  item: BuilderItem | null;
  onChange(patch: Partial<BuilderItem>): void;
  onDataChange(key: string, value: unknown): void;
}

const SPAN_CHOICES = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "full"];

export function Inspector({ item, onChange, onDataChange }: InspectorProps) {
  return (
    <aside
      className={css({
        width: "260px",
        flexShrink: 0,
        borderLeft: "1px solid",
        borderColor: "pageBorder",
        padding: 3,
        overflowY: "auto",
        fontFamily: "mono",
        fontSize: "sm",
      })}
    >
      <h2
        className={css({
          fontSize: "sm",
          fontWeight: "bold",
          textTransform: "uppercase",
          mb: 3,
          letterSpacing: "wide",
        })}
      >
        Inspector
      </h2>
      {!item && (
        <p className={css({ opacity: 0.6 })}>
          Select an item on the canvas to edit its props, or drop a block from the palette.
        </p>
      )}
      {item && <InspectorBody item={item} onChange={onChange} onDataChange={onDataChange} />}
    </aside>
  );
}

interface InspectorBodyProps {
  item: BuilderItem;
  onChange(patch: Partial<BuilderItem>): void;
  onDataChange(key: string, value: unknown): void;
}

function InspectorBody({ item, onChange, onDataChange }: InspectorBodyProps) {
  const def = blokDef(item.type);

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: 3 })}>
      <Group label="Block">
        <Row label="Type" value={def?.label ?? item.type} />
        <Row label="UID" value={item.id} mono />
      </Group>

      <Group label="Position">
        <NumberField
          label="Col Start"
          value={item.x + 1}
          min={1}
          max={GRID_COLS}
          onChange={(v) => onChange({ x: Math.max(0, v - 1) })}
        />
        <NumberField
          label="Row Start"
          value={item.y + 1}
          min={1}
          onChange={(v) => onChange({ y: Math.max(0, v - 1) })}
        />
        <NumberField
          label="Col Span"
          value={item.w}
          min={1}
          max={GRID_COLS}
          onChange={(v) => onChange({ w: v })}
        />
        <NumberField label="Row Span" value={item.h} min={1} onChange={(v) => onChange({ h: v })} />
        <SelectField
          label="Col Span (md)"
          value={item.wMd ? String(item.wMd) : ""}
          options={SPAN_CHOICES.map((v) => ({ value: v, label: v || "—" }))}
          onChange={(v) =>
            onChange({ wMd: v ? (v === "full" ? undefined : Number(v)) : undefined })
          }
        />
        <SelectField
          label="Col Span (lg)"
          value={item.wLg ? String(item.wLg) : ""}
          options={SPAN_CHOICES.map((v) => ({ value: v, label: v || "—" }))}
          onChange={(v) =>
            onChange({ wLg: v ? (v === "full" ? undefined : Number(v)) : undefined })
          }
        />
        <NumberField
          label="Row Span (md)"
          value={item.hMd ?? 0}
          min={0}
          onChange={(v) => onChange({ hMd: v > 0 ? v : undefined })}
        />
        <NumberField
          label="Row Span (lg)"
          value={item.hLg ?? 0}
          min={0}
          onChange={(v) => onChange({ hLg: v > 0 ? v : undefined })}
        />
      </Group>

      <Group label="Grid Item">
        <SelectField
          label="Align Self"
          value={item.alignSelf ?? ""}
          options={ALIGN_SELF_OPTIONS}
          onChange={(v) => onChange({ alignSelf: v || undefined })}
        />
        <SelectField
          label="Justify Self"
          value={item.justifySelf ?? ""}
          options={ALIGN_SELF_OPTIONS}
          onChange={(v) => onChange({ justifySelf: v || undefined })}
        />
      </Group>

      <Group label="Spacing (margin)">
        <SelectField
          label="Top"
          value={item.mt ?? ""}
          options={SPACING_OPTIONS}
          onChange={(v) => onChange({ mt: v || undefined })}
        />
        <SelectField
          label="Bottom"
          value={item.mb ?? ""}
          options={SPACING_OPTIONS}
          onChange={(v) => onChange({ mb: v || undefined })}
        />
        <SelectField
          label="Left"
          value={item.ml ?? ""}
          options={SPACING_OPTIONS}
          onChange={(v) => onChange({ ml: v || undefined })}
        />
        <SelectField
          label="Right"
          value={item.mr ?? ""}
          options={SPACING_OPTIONS}
          onChange={(v) => onChange({ mr: v || undefined })}
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

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section
      className={css({
        border: "1px solid",
        borderColor: "pageBorder",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      })}
    >
      <h3
        className={css({
          fontSize: "sm",
          textTransform: "uppercase",
          letterSpacing: "wide",
          opacity: 0.6,
        })}
      >
        {label}
      </h3>
      {children}
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className={css({ display: "flex", justifyContent: "space-between", gap: 2 })}>
      <span className={css({ opacity: 0.6 })}>{label}</span>
      <span
        className={css({
          textAlign: "right",
          wordBreak: "break-all",
          fontFamily: mono ? "mono" : undefined,
        })}
      >
        {value}
      </span>
    </div>
  );
}

const labelCss = css({ display: "flex", flexDirection: "column", gap: 1 });
const fieldCss = css({
  width: "100%",
  padding: 1,
  border: "1px solid",
  borderColor: "pageBorder",
  bg: "pageBg",
  color: "pageFg",
  fontFamily: "mono",
  fontSize: "sm",
});

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
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange(v: string): void;
}) {
  return (
    <label className={labelCss}>
      <span className={css({ opacity: 0.6 })}>{label}</span>
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
        <label className={css({ display: "flex", gap: 2, alignItems: "center" })}>
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
    case "text":
    default:
      return (
        <label className={labelCss}>
          <span className={css({ opacity: 0.6 })}>{field.label}</span>
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.type === "assetUrl" ? "https://..." : undefined}
            className={fieldCss}
          />
        </label>
      );
  }
}
