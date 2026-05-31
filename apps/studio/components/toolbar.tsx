"use client";

import { useState } from "react";
import { css } from "styled-system/css";

import {
  type ExportedGrid,
  GRID_COLS,
  type GridSettings,
  SPACING_OPTIONS,
  type Viewport,
} from "./lib";

interface ToolbarProps {
  settings: GridSettings;
  onSettingsChange(next: GridSettings): void;
  viewport: Viewport;
  onViewportChange(next: Viewport): void;
  exported: ExportedGrid;
  itemCount: number;
  pushEnabled: boolean;
  siteUrl: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo(): void;
  onRedo(): void;
  onImport(): void;
  onClear(): void;
}

const VIEWPORTS: { id: Viewport; label: string }[] = [
  { id: "base", label: "Mobile" },
  { id: "md", label: "Tablet" },
  { id: "lg", label: "Desktop" },
];

type Status = { kind: "idle" } | { kind: "ok"; text: string } | { kind: "error"; text: string };

export function Toolbar({
  settings,
  onSettingsChange,
  viewport,
  onViewportChange,
  exported,
  itemCount,
  pushEnabled,
  siteUrl,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onImport,
  onClear,
}: ToolbarProps) {
  const siteHost = (siteUrl ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const [showPush, setShowPush] = useState(false);
  const [slug, setSlug] = useState("");
  const [mode, setMode] = useState<"append" | "replace">("append");
  const [replaceIndex, setReplaceIndex] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pushing, setPushing] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(exported, null, 2));
      setStatus({ kind: "ok", text: "JSON copied" });
    } catch {
      setStatus({ kind: "error", text: "Clipboard failed" });
    }
  };

  const handlePush = async () => {
    if (!slug) {
      setStatus({ kind: "error", text: "Enter target story full_slug" });
      return;
    }
    setPushing(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          grid: exported,
          mode,
          replaceIndex: mode === "replace" ? replaceIndex : undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        action?: "appended" | "replaced";
        index?: number;
      };
      if (!res.ok || !data.ok) {
        setStatus({ kind: "error", text: data.error ?? `HTTP ${res.status}` });
      } else {
        const verb = data.action === "replaced" ? "Replaced" : "Appended";
        const where = typeof data.index === "number" ? ` at body[${data.index}]` : "";
        setStatus({ kind: "ok", text: `${verb}${where} in ${slug}` });
      }
    } catch (e) {
      setStatus({ kind: "error", text: (e as Error).message });
    } finally {
      setPushing(false);
    }
  };

  return (
    <header
      className={css({
        borderBottom: "1px solid",
        borderColor: "pageBorder",
        padding: 3,
        fontFamily: "mono",
        fontSize: "sm",
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        alignItems: "center",
      })}
    >
      <span
        className={css({
          fontFamily: "mono",
          fontSize: "sm",
          display: "inline-flex",
          gap: 1,
          alignItems: "baseline",
        })}
      >
        <span>hello</span>
        <a
          href={siteUrl || "/"}
          className={css({
            color: "pageFg",
            textDecoration: "underline",
            _hover: { opacity: 0.7 },
          })}
        >
          {siteHost || "httpjpg"}
        </a>
        <span className={css({ opacity: 0.6 })}>/ Studio</span>
      </span>
      <span className={css({ opacity: 0.6 })}>{itemCount} items</span>

      <Divider />

      <div
        className={css({
          display: "inline-flex",
          border: "1px solid",
          borderColor: "pageBorder",
        })}
      >
        {VIEWPORTS.map((v) => {
          const isActive = v.id === viewport;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewportChange(v.id)}
              aria-pressed={isActive}
              className={css({
                padding: "1px 8px",
                bg: isActive ? "pageFg" : "pageBg",
                color: isActive ? "pageBg" : "pageFg",
                fontFamily: "mono",
                fontSize: "sm",
                cursor: "pointer",
                border: "none",
                _hover: { bg: "pageFg", color: "pageBg" },
              })}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      <Divider />

      <ColField
        label="Cols"
        active={viewport === "base"}
        value={settings.columns}
        onChange={(v) => onSettingsChange({ ...settings, columns: v })}
      />
      <ColField
        label="Cols (md)"
        active={viewport === "md"}
        value={settings.columnsMd ?? settings.columns}
        onChange={(v) => onSettingsChange({ ...settings, columnsMd: v })}
      />
      <ColField
        label="Cols (lg)"
        active={viewport === "lg"}
        value={settings.columnsLg ?? settings.columns}
        onChange={(v) => onSettingsChange({ ...settings, columnsLg: v })}
      />
      <SelectField
        label="Gap"
        value={settings.gap}
        options={SPACING_OPTIONS}
        onChange={(v) => onSettingsChange({ ...settings, gap: v })}
      />

      <Divider />

      <button type="button" onClick={onUndo} disabled={!canUndo} className={btn} title="Undo (⌘Z)">
        Undo
      </button>
      <button type="button" onClick={onRedo} disabled={!canRedo} className={btn} title="Redo (⇧⌘Z)">
        Redo
      </button>

      <Divider />

      <button type="button" onClick={onImport} className={btn}>
        Import…
      </button>
      <button type="button" onClick={handleCopy} className={btn}>
        Copy JSON
      </button>
      {pushEnabled && (
        <button
          type="button"
          onClick={() => setShowPush((s) => !s)}
          className={btn}
          aria-pressed={showPush}
        >
          {showPush ? "Hide push" : "Push…"}
        </button>
      )}
      <button type="button" onClick={onClear} className={btn}>
        Clear
      </button>

      {status.kind !== "idle" && (
        <output
          className={css({
            ml: "auto",
            color: status.kind === "error" ? "danger.500" : "success.500",
          })}
        >
          {status.text}
        </output>
      )}

      {pushEnabled && showPush && (
        <div
          className={css({
            width: "100%",
            display: "flex",
            gap: 2,
            alignItems: "center",
            borderTop: "1px solid",
            borderColor: "pageBorder",
            pt: 2,
            mt: 1,
            flexWrap: "wrap",
          })}
        >
          <label className={css({ display: "flex", gap: 1, alignItems: "center", flex: 1 })}>
            <span className={css({ opacity: 0.6, whiteSpace: "nowrap" })}>Target full_slug</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. work/example or studio/scratch"
              className={css({
                flex: 1,
                padding: 1,
                border: "1px solid",
                borderColor: "pageBorder",
                bg: "pageBg",
                color: "pageFg",
                fontFamily: "mono",
                fontSize: "sm",
              })}
            />
          </label>

          <div
            className={css({
              display: "inline-flex",
              border: "1px solid",
              borderColor: "pageBorder",
            })}
          >
            {(["append", "replace"] as const).map((m) => {
              const active = m === mode;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={active}
                  className={css({
                    padding: "1px 8px",
                    bg: active ? "pageFg" : "pageBg",
                    color: active ? "pageBg" : "pageFg",
                    fontFamily: "mono",
                    fontSize: "sm",
                    cursor: "pointer",
                    border: "none",
                    _hover: { bg: "pageFg", color: "pageBg" },
                  })}
                >
                  {m === "append" ? "Append" : "Replace"}
                </button>
              );
            })}
          </div>

          {mode === "replace" && (
            <label className={css({ display: "flex", gap: 1, alignItems: "center" })}>
              <span className={css({ opacity: 0.6, whiteSpace: "nowrap" })}>body[N]</span>
              <input
                type="number"
                min={0}
                value={replaceIndex}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n) && n >= 0) setReplaceIndex(n);
                }}
                className={css({
                  width: "50px",
                  padding: 1,
                  border: "1px solid",
                  borderColor: "pageBorder",
                  bg: "pageBg",
                  color: "pageFg",
                  fontFamily: "mono",
                  fontSize: "sm",
                })}
              />
            </label>
          )}

          <button type="button" onClick={handlePush} disabled={pushing} className={btn}>
            {pushing ? "Pushing…" : mode === "replace" ? "Replace in story" : "Append to story"}
          </button>
        </div>
      )}
    </header>
  );
}

const btn = css({
  padding: "1px 8px",
  border: "1px solid",
  borderColor: "pageBorder",
  bg: "pageBg",
  color: "pageFg",
  fontFamily: "mono",
  fontSize: "sm",
  cursor: "pointer",
  height: "24px",
  _hover: { bg: "pageFg", color: "pageBg" },
  _disabled: { cursor: "not-allowed", opacity: 0.5, _hover: { bg: "pageBg", color: "pageFg" } },
});

function Divider() {
  return (
    <span
      className={css({
        width: "1px",
        height: "20px",
        bg: "pageBorder",
      })}
      aria-hidden
    />
  );
}

function ColField({
  label,
  value,
  active,
  onChange,
}: {
  label: string;
  value: number;
  active?: boolean;
  onChange(v: number): void;
}) {
  return (
    <label
      className={css({ display: "flex", gap: 1, alignItems: "center" })}
      style={{ opacity: active ? 1 : 0.6 }}
    >
      <span>{label}</span>
      <input
        type="number"
        min={1}
        max={GRID_COLS}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v) && v >= 1 && v <= GRID_COLS) onChange(v);
        }}
        className={css({
          width: "40px",
          padding: 1,
          border: "1px solid",
          borderColor: "pageBorder",
          bg: "pageBg",
          color: "pageFg",
          fontFamily: "mono",
          fontSize: "sm",
        })}
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
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange(v: string): void;
}) {
  return (
    <label className={css({ display: "flex", gap: 1, alignItems: "center" })}>
      <span className={css({ opacity: 0.6 })}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={css({
          padding: 1,
          border: "1px solid",
          borderColor: "pageBorder",
          bg: "pageBg",
          color: "pageFg",
          fontFamily: "mono",
          fontSize: "sm",
        })}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label || "—"}
          </option>
        ))}
      </select>
    </label>
  );
}
