"use client";

import { type PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { css } from "styled-system/css";

import { BlokPreview } from "./blok-preview";
import {
  type BuilderItem,
  blokPlugin,
  clamp,
  createItemId,
  effectiveColumns,
  effectiveH,
  effectiveHidden,
  effectiveSpacing,
  effectiveW,
  effectiveX,
  effectiveY,
  emptySpacing,
  type GridSettings,
  MIN_ROWS,
  patchPosition,
  patchSize,
  ROW_HEIGHT_PX,
  type SpacingSet,
  spacingToPx,
  type Viewport,
  VIEWPORT_WIDTH_PX,
} from "./lib";

interface CanvasProps {
  items: BuilderItem[];
  selectedId: string | null;
  settings: GridSettings;
  viewport: Viewport;
  extraRows: number;
  onItemsChange(next: BuilderItem[]): void;
  onSelect(id: string | null): void;
  onAddRows(count: number): void;
  onRemoveRows(count: number): void;
}

interface DragState {
  id: string;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  origin: BuilderItem;
}

export function Canvas({
  items,
  selectedId,
  settings,
  viewport,
  extraRows,
  onItemsChange,
  onSelect,
  onAddRows,
  onRemoveRows,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);

  const cols = effectiveColumns(settings, viewport);
  const occupiedRows = Math.max(
    0,
    ...items.map((it) => effectiveY(it, viewport) + effectiveH(it, viewport)),
  );
  const rows = Math.max(MIN_ROWS, occupiedRows + 4) + extraRows;
  const gapPx = spacingToPx(settings.gap) ?? "0";
  const maxWidth = VIEWPORT_WIDTH_PX[viewport];

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: globalThis.PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const gapValue = pxFromCssValue(gapPx);
      const cw = (el.clientWidth - (cols - 1) * gapValue) / cols;
      if (!cw) return;
      const dxCells = Math.round((e.clientX - drag.startX) / (cw + gapValue));
      const dyCells = Math.round((e.clientY - drag.startY) / (ROW_HEIGHT_PX + gapValue));

      const current = itemsRef.current;
      const originX = effectiveX(drag.origin, viewport);
      const originY = effectiveY(drag.origin, viewport);
      const originW = effectiveW(drag.origin, viewport);
      const originH = effectiveH(drag.origin, viewport);
      if (drag.mode === "move") {
        const x = clamp(originX + dxCells, 0, cols - originW);
        const y = Math.max(0, originY + dyCells);
        const patch = patchPosition(viewport, x, y);
        onItemsChange(current.map((it) => (it.id === drag.id ? { ...it, ...patch } : it)));
      } else {
        const w = clamp(originW + dxCells, 1, cols - originX);
        const h = Math.max(1, originH + dyCells);
        const patch = patchSize(viewport, w, h);
        onItemsChange(current.map((it) => (it.id === drag.id ? { ...it, ...patch } : it)));
      }
    };
    const onUp = () => setDrag(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drag, cols, gapPx, viewport, onItemsChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/x-blok-type");
      if (!type) return;
      const def = blokPlugin(type);
      if (!def) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const gapValue = pxFromCssValue(gapPx);
      const cw = (rect.width - (cols - 1) * gapValue) / cols;
      const x = clamp(
        Math.floor((e.clientX - rect.left) / (cw + gapValue)),
        0,
        cols - def.defaultSize.w,
      );
      const y = Math.max(0, Math.floor((e.clientY - rect.top) / (ROW_HEIGHT_PX + gapValue)));
      const item: BuilderItem = {
        id: createItemId(),
        type,
        x,
        y,
        w: Math.min(def.defaultSize.w, cols),
        h: def.defaultSize.h,
        spacing: emptySpacing(),
        data: { ...def.defaults },
      };
      onItemsChange([...items, item]);
      onSelect(item.id);
      setHoverCell(null);
    },
    [cols, items, onItemsChange, onSelect],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      const rect = e.currentTarget.getBoundingClientRect();
      const gapValue = pxFromCssValue(gapPx);
      const cw = (rect.width - (cols - 1) * gapValue) / cols;
      const x = clamp(Math.floor((e.clientX - rect.left) / (cw + gapValue)), 0, cols - 1);
      const y = Math.max(0, Math.floor((e.clientY - rect.top) / (ROW_HEIGHT_PX + gapValue)));
      setHoverCell({ x, y });
    },
    [cols, gapPx],
  );

  return (
    <div
      className={css({ flex: 1, padding: 4, fontFamily: "mono", bg: "pageBg", overflow: "auto" })}
    >
      <div
        className={css({ marginX: "auto" })}
        style={{ maxWidth: maxWidth ? `${maxWidth}px` : undefined }}
      >
        <div
          ref={containerRef}
          role="application"
          aria-label="Grid canvas"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setHoverCell(null)}
          onClick={(e) => {
            if (e.target === e.currentTarget) onSelect(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onSelect(null);
          }}
          className={css({
            position: "relative",
            display: "grid",
            width: "100%",
            border: "1px solid",
            borderColor: "pageBorder",
          })}
          style={{
            minHeight: `${rows * ROW_HEIGHT_PX}px`,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridAutoRows: `${ROW_HEIGHT_PX}px`,
            gap: gapPx,
          }}
        >
          {Array.from({ length: cols }, (_, i) => i + 1).map((col) => (
            <div
              key={`col-${col}`}
              className={css({
                opacity: 0.35,
                borderColor: "pageBorder",
                borderRight: "1px dashed",
                borderLeft: "1px dashed",
                pointerEvents: "none",
              })}
              style={{
                gridColumn: `${col} / span 1`,
                gridRow: `1 / span ${rows}`,
              }}
              aria-hidden
            />
          ))}
          {Array.from({ length: rows }, (_, i) => i + 1).map((row) => (
            <div
              key={`row-${row}`}
              className={css({
                opacity: 0.35,
                borderColor: "pageBorder",
                borderTop: "1px dashed",
                borderBottom: "1px dashed",
                pointerEvents: "none",
              })}
              style={{
                gridColumn: `1 / span ${cols}`,
                gridRow: `${row} / span 1`,
              }}
              aria-hidden
            />
          ))}
          {hoverCell && drag === null && (
            <div
              className={css({ opacity: 0.1, bg: "pageFg", pointerEvents: "none" })}
              style={{
                gridColumn: `${hoverCell.x + 1} / span 1`,
                gridRow: `${hoverCell.y + 1} / span 1`,
              }}
            />
          )}
          {items.map((it) => (
            <CanvasItem
              key={it.id}
              item={it}
              viewport={viewport}
              cols={cols}
              selected={it.id === selectedId}
              onSelect={() => onSelect(it.id)}
              onStartDrag={(mode, e) => {
                e.stopPropagation();
                setDrag({
                  id: it.id,
                  mode,
                  startX: e.clientX,
                  startY: e.clientY,
                  origin: { ...it },
                });
                onSelect(it.id);
              }}
              onDelete={() => {
                onItemsChange(items.filter((x) => x.id !== it.id));
                if (selectedId === it.id) onSelect(null);
              }}
            />
          ))}
        </div>
        <div
          className={css({
            display: "flex",
            justifyContent: "center",
            gap: 2,
            padding: 2,
          })}
        >
          <button type="button" onClick={() => onAddRows(10)} className={rowBtn}>
            + 10 rows
          </button>
          <button
            type="button"
            onClick={() => onRemoveRows(10)}
            disabled={extraRows <= 0}
            className={rowBtn}
          >
            − 10 rows
          </button>
          <span className={css({ opacity: 0.6, fontFamily: "mono", fontSize: "sm" })}>
            {rows} rows
          </span>
        </div>
      </div>
    </div>
  );
}

const rowBtn = css({
  padding: "4px 16px",
  color: "pageFg",
  opacity: 0.6,
  fontFamily: "mono",
  fontSize: "sm",
  bg: "pageBg",
  border: "1px dashed",
  borderColor: "pageBorder",
  cursor: "pointer",
  _hover: { color: "pageBg", opacity: 1, bg: "pageFg" },
  _disabled: { opacity: 0.3, cursor: "not-allowed", _hover: { color: "pageFg", bg: "pageBg" } },
});

interface CanvasItemProps {
  item: BuilderItem;
  viewport: Viewport;
  cols: number;
  selected: boolean;
  onSelect(): void;
  onStartDrag(mode: "move" | "resize", e: PointerEvent<HTMLElement>): void;
  onDelete(): void;
}

function CanvasItem({
  item,
  viewport,
  cols,
  selected,
  onSelect,
  onStartDrag,
  onDelete,
}: CanvasItemProps) {
  const def = blokPlugin(item.type);
  const w = Math.min(effectiveW(item, viewport), cols);
  const h = effectiveH(item, viewport);
  const itemY = effectiveY(item, viewport);
  const itemX = effectiveX(item, viewport);
  const x = Math.min(itemX, Math.max(0, cols - w));
  const spacing = effectiveSpacing(item, viewport);
  const hidden = effectiveHidden(item, viewport);

  return (
    <div
      className={css({
        position: "relative",
        boxSizing: "border-box",
        color: "pageFg",
        opacity: hidden ? 0.35 : 1,
        bg: "pageBg",
        border: "1px solid",
        borderColor: selected ? "pageFg" : "pageBorder",
        borderStyle: hidden ? "dashed" : "solid",
        boxShadow: selected ? "inset 0 0 0 1px var(--colors-page-fg)" : "none",
      })}
      style={{
        gridColumn: `${x + 1} / span ${w}`,
        gridRow: `${itemY + 1} / span ${h}`,
        alignSelf: item.alignSelf || undefined,
        justifySelf: item.justifySelf || undefined,
        ...marginStyle(spacing),
      }}
    >
      <button
        type="button"
        aria-label={`${def?.label ?? item.type} block`}
        onPointerDown={(e) => onStartDrag("move", e)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onKeyDown={(e) => {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (selected) onDelete();
          }
        }}
        className={css({
          position: "relative",
          boxSizing: "border-box",
          display: "block",
          width: "100%",
          height: "100%",
          color: "pageFg",
          textAlign: "left",
          cursor: "move",
          userSelect: "none",
          touchAction: "none",
          overflow: "hidden",
          all: "unset",
        })}
        style={paddingStyle(spacing)}
      >
        <div
          className={css({
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            padding: "1px 6px",
            color: "pageBg",
            opacity: selected ? 1 : 0.5,
            fontFamily: "mono",
            fontSize: "sm",
            textTransform: "uppercase",
            bg: "pageFg",
            pointerEvents: "none",
          })}
        >
          <span>{def?.label ?? item.type}</span>
          <span>
            · {w}×{h}
          </span>
        </div>
        <BlokPreview item={item} />
      </button>
      {selected && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className={css({
            position: "absolute",
            top: 1,
            right: 1,
            zIndex: 3,
            width: "20px",
            height: "20px",
            color: "pageFg",
            fontSize: "sm",
            lineHeight: 1,
            bg: "pageBg",
            border: "1px solid",
            borderColor: "pageFg",
            cursor: "pointer",
            _hover: { color: "pageBg", bg: "pageFg" },
          })}
          aria-label="Delete"
        >
          ×
        </button>
      )}
      <button
        type="button"
        aria-label="Resize"
        onPointerDown={(e) => {
          e.stopPropagation();
          onStartDrag("resize", e);
        }}
        onClick={(e) => e.stopPropagation()}
        className={css({
          position: "absolute",
          right: "-1px",
          bottom: "-1px",
          zIndex: 3,
          width: "14px",
          height: "14px",
          opacity: selected ? 1 : 0.4,
          bg: "pageFg",
          cursor: "se-resize",
          touchAction: "none",
          all: "unset",
          _hover: { opacity: 1 },
        })}
      />
    </div>
  );
}

function marginStyle(s: SpacingSet): React.CSSProperties {
  return {
    marginTop: spacingToPx(s.mt),
    marginBottom: spacingToPx(s.mb),
    marginLeft: spacingToPx(s.ml),
    marginRight: spacingToPx(s.mr),
  };
}

function paddingStyle(s: SpacingSet): React.CSSProperties {
  return {
    paddingTop: spacingToPx(s.pt) ?? "4px",
    paddingBottom: spacingToPx(s.pb) ?? "4px",
    paddingLeft: spacingToPx(s.pl) ?? "4px",
    paddingRight: spacingToPx(s.pr) ?? "4px",
  };
}

function pxFromCssValue(value?: string): number {
  if (!value) return 0;
  if (value.endsWith("rem")) return Number.parseFloat(value) * 16;
  if (value.endsWith("px")) return Number.parseFloat(value);
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}
