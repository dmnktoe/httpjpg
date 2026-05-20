"use client";

import { useState } from "react";
import { css } from "styled-system/css";

import { type BuilderItem, deserializeGrid, type ExportedGrid, type GridSettings } from "./lib";

interface ImportDialogProps {
  open: boolean;
  pushEnabled: boolean;
  onClose(): void;
  onImport(payload: { settings: GridSettings; items: BuilderItem[] }): void;
}

type Mode = "paste" | "fetch";

interface BodyEntry {
  component?: string;
  [key: string]: unknown;
}

function findFirstGrid(body: unknown): ExportedGrid | null {
  if (!Array.isArray(body)) return null;
  for (const entry of body as BodyEntry[]) {
    if (entry?.component === "grid") return entry as unknown as ExportedGrid;
  }
  return null;
}

export function ImportDialog({ open, pushEnabled, onClose, onImport }: ImportDialogProps) {
  const [mode, setMode] = useState<Mode>("paste");
  const [paste, setPaste] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const importPasted = () => {
    setError(null);
    try {
      const parsed = JSON.parse(paste) as
        | ExportedGrid
        | { story?: { content?: { body?: unknown } } };
      const grid =
        "component" in parsed && parsed.component === "grid"
          ? (parsed as ExportedGrid)
          : (findFirstGrid(
              (parsed as { story?: { content?: { body?: unknown } } }).story?.content?.body,
            ) ?? findFirstGrid((parsed as { content?: { body?: unknown } }).content?.body));
      if (!grid) {
        setError("Could not find a grid blok in the pasted JSON");
        return;
      }
      onImport(deserializeGrid(grid));
      onClose();
      setPaste("");
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
      const grid = findFirstGrid(data.story.content?.body);
      if (!grid) {
        setError(`Story "${slug}" has no grid blok in its body`);
        return;
      }
      onImport(deserializeGrid(grid));
      onClose();
      setSlug("");
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
          {mode === "paste" && (
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
          {mode === "fetch" && (
            <>
              <p className={css({ opacity: 0.7 })}>
                Fetches the story via the Management API and imports the first <code>grid</code>{" "}
                entry from its body[].
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
