"use client";

import { useState } from "react";
import { css } from "styled-system/css";

import {
  type BuilderItem,
  deserializeGrid,
  type ExportedGrid,
  findGridsInBody,
  type GridSettings,
} from "./lib";

interface ImportDialogProps {
  open: boolean;
  pushEnabled: boolean;
  onClose(): void;
  onImport(payload: { settings: GridSettings; items: BuilderItem[] }): void;
}

type Mode = "paste" | "fetch";

function extractGrids(raw: unknown): ExportedGrid[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as {
    component?: string;
    body?: unknown;
    items?: unknown;
    story?: { content?: { body?: unknown } };
    content?: { body?: unknown };
  };
  if (obj.component === "grid") return [raw as ExportedGrid];
  if (Array.isArray(obj.body)) return findGridsInBody(obj.body);
  if (obj.story?.content?.body) return findGridsInBody(obj.story.content.body);
  if (obj.content?.body) return findGridsInBody(obj.content.body);
  return [];
}

function summarizeGrid(grid: ExportedGrid, index: number): string {
  const itemCount = grid.items?.length ?? 0;
  const cols = grid.columnsLg ?? grid.columnsMd ?? grid.columns ?? "?";
  return `#${index + 1} · ${itemCount} items · ${cols} cols (lg)`;
}

export function ImportDialog({ open, pushEnabled, onClose, onImport }: ImportDialogProps) {
  const [mode, setMode] = useState<Mode>("paste");
  const [paste, setPaste] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [candidates, setCandidates] = useState<ExportedGrid[]>([]);
  const [pickIndex, setPickIndex] = useState(0);

  if (!open) return null;

  const commit = (grid: ExportedGrid) => {
    onImport(deserializeGrid(grid));
    onClose();
    setPaste("");
    setSlug("");
    setCandidates([]);
    setPickIndex(0);
  };

  const loadCandidates = (grids: ExportedGrid[]) => {
    if (grids.length === 0) {
      setError("Could not find a grid blok in the input");
      return;
    }
    if (grids.length === 1) {
      commit(grids[0]);
      return;
    }
    setCandidates(grids);
    setPickIndex(0);
  };

  const importPasted = () => {
    setError(null);
    try {
      const parsed = JSON.parse(paste) as unknown;
      loadCandidates(extractGrids(parsed));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const importFromStoryblok = async () => {
    if (!slug) {
      setError("Enter a story slug");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/studio/fetch-story?slug=${encodeURIComponent(slug)}`);
      const data = (await res.json()) as {
        ok?: boolean;
        story?: { content?: { body?: unknown } };
        error?: string;
      };
      if (!res.ok || !data.ok || !data.story) {
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      const grids = findGridsInBody(data.story.content?.body);
      if (grids.length === 0) {
        setError(`Story "${slug}" has no grid blok in its body`);
        return;
      }
      loadCandidates(grids);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={css({
        position: "fixed",
        inset: 0,
        bg: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      })}
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close import dialog"
        onClick={onClose}
        className={css({
          all: "unset",
          position: "absolute",
          inset: 0,
          cursor: "default",
        })}
      />
      <dialog
        open
        className={css({
          bg: "pageBg",
          color: "pageFg",
          border: "1px solid",
          borderColor: "pageFg",
          width: "560px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "mono",
          fontSize: "sm",
          position: "relative",
          padding: 0,
          margin: 0,
        })}
        aria-label="Import grid"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <header
          className={css({
            padding: 3,
            borderBottom: "1px solid",
            borderColor: "pageBorder",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          })}
        >
          <strong className={css({ textTransform: "uppercase", letterSpacing: "wide" })}>
            Import Grid
          </strong>
          <button
            type="button"
            onClick={onClose}
            className={css({
              all: "unset",
              cursor: "pointer",
              padding: "0 6px",
              _hover: { bg: "pageFg", color: "pageBg" },
            })}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div
          className={css({ display: "flex", borderBottom: "1px solid", borderColor: "pageBorder" })}
        >
          <ModeTab active={mode === "paste"} onClick={() => setMode("paste")}>
            Paste JSON
          </ModeTab>
          {pushEnabled && (
            <ModeTab active={mode === "fetch"} onClick={() => setMode("fetch")}>
              Fetch from Storyblok
            </ModeTab>
          )}
        </div>

        <div
          className={css({
            padding: 3,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          })}
        >
          {candidates.length > 0 && (
            <>
              <p className={css({ opacity: 0.7 })}>
                Multiple grids found. Pick which one to import.
              </p>
              <label className={css({ display: "flex", flexDirection: "column", gap: 1 })}>
                <span className={css({ opacity: 0.6 })}>Grid</span>
                <select
                  value={pickIndex}
                  onChange={(e) => setPickIndex(Number(e.target.value))}
                  className={inputCss}
                >
                  {candidates.map((g, i) => (
                    <option key={g._uid ?? i} value={i}>
                      {summarizeGrid(g, i)}
                    </option>
                  ))}
                </select>
              </label>
              <div className={css({ display: "flex", justifyContent: "flex-end", gap: 2 })}>
                <button
                  type="button"
                  onClick={() => {
                    setCandidates([]);
                    setPickIndex(0);
                  }}
                  className={btn}
                >
                  Back
                </button>
                <button type="button" onClick={() => commit(candidates[pickIndex])} className={btn}>
                  Import grid {pickIndex + 1}
                </button>
              </div>
            </>
          )}
          {candidates.length === 0 && mode === "paste" && (
            <>
              <p className={css({ opacity: 0.7 })}>
                Paste a grid blok JSON or a full story payload. Replaces the current grid.
              </p>
              <textarea
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                rows={12}
                placeholder='{ "component": "grid", "items": [...] }'
                className={inputCss}
              />
              <div className={css({ display: "flex", justifyContent: "flex-end", gap: 2 })}>
                <button type="button" onClick={onClose} className={btn}>
                  Cancel
                </button>
                <button type="button" onClick={importPasted} disabled={!paste} className={btn}>
                  Import
                </button>
              </div>
            </>
          )}
          {candidates.length === 0 && mode === "fetch" && (
            <>
              <p className={css({ opacity: 0.7 })}>
                Fetches the story via the Management API and picks a <code>grid</code> entry from
                its body[].
              </p>
              <label className={css({ display: "flex", flexDirection: "column", gap: 1 })}>
                <span className={css({ opacity: 0.6 })}>Story full_slug</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. work/example"
                  className={inputCss}
                />
              </label>
              <div className={css({ display: "flex", justifyContent: "flex-end", gap: 2 })}>
                <button type="button" onClick={onClose} className={btn}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={importFromStoryblok}
                  disabled={!slug || busy}
                  className={btn}
                >
                  {busy ? "Fetching…" : "Import"}
                </button>
              </div>
            </>
          )}
          {error && <p className={css({ color: "danger.500", whiteSpace: "pre-wrap" })}>{error}</p>}
        </div>
      </dialog>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick(): void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={css({
        flex: 1,
        padding: 2,
        bg: active ? "pageFg" : "pageBg",
        color: active ? "pageBg" : "pageFg",
        fontFamily: "mono",
        fontSize: "sm",
        textTransform: "uppercase",
        letterSpacing: "wide",
        cursor: "pointer",
        border: "none",
        _hover: { bg: "pageFg", color: "pageBg" },
      })}
    >
      {children}
    </button>
  );
}

const inputCss = css({
  width: "100%",
  padding: 2,
  border: "1px solid",
  borderColor: "pageBorder",
  bg: "pageBg",
  color: "pageFg",
  fontFamily: "mono",
  fontSize: "sm",
  resize: "vertical",
});

const btn = css({
  padding: "4px 12px",
  border: "1px solid",
  borderColor: "pageBorder",
  bg: "pageBg",
  color: "pageFg",
  fontFamily: "mono",
  fontSize: "sm",
  cursor: "pointer",
  _hover: { bg: "pageFg", color: "pageBg" },
  _disabled: { cursor: "not-allowed", opacity: 0.4, _hover: { bg: "pageBg", color: "pageFg" } },
});
