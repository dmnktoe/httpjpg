"use client";

import { type PointerEvent, useCallback, useRef, useState } from "react";
import { css } from "styled-system/css";

import {
  type BuilderItem,
  blokDef,
  clamp,
  createItemId,
  type GridSettings,
  ROW_HEIGHT_PX,
} from "./lib";

interface CanvasProps {
  items: BuilderItem[];
  selectedId: string | null;
  settings: GridSettings;
  onItemsChange(next: BuilderItem[]): void;
  onSelect(id: string | null): void;
}

interface DragState {
  id: string;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  origin: BuilderItem;
}

export function Canvas({ items, selectedId, settings, onItemsChange, onSelect }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);

  const cols = settings.columns;
  const rows = Math.max(20, ...items.map((it) => it.y + it.h)) + 4;

  const cellWidth = () => {
    const el = containerRef.current;
    if (!el) return 0;
    return el.clientWidth / cols;
  };

  const updateItem = useCallback(
    (id: string, patch: Partial<BuilderItem>) => {
      onItemsChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    },
    [items, onItemsChange],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const cw = cellWidth();
      if (!cw) return;
      const dxCells = Math.round((e.clientX - drag.startX) / cw);
      const dyCells = Math.round((e.clientY - drag.startY) / ROW_HEIGHT_PX);

      if (drag.mode === "move") {
        const x = clamp(drag.origin.x + dxCells, 0, cols - drag.origin.w);
        const y = Math.max(0, drag.origin.y + dyCells);
        updateItem(drag.id, { x, y });
      } else {
        const w = clamp(drag.origin.w + dxCells, 1, cols - drag.origin.x);
        const h = Math.max(1, drag.origin.h + dyCells);
        updateItem(drag.id, { w, h });
      }
    },
    [cols, drag, updateItem],
  );

  const handlePointerUp = useCallback(() => setDrag(null), []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/x-blok-type");
      if (!type) return;
      const def = blokDef(type);
      if (!def) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const cw = rect.width / cols;
      const x = clamp(Math.floor((e.clientX - rect.left) / cw), 0, cols - def.defaultSize.w);
      const y = Math.max(0, Math.floor((e.clientY - rect.top) / ROW_HEIGHT_PX));
      const item: BuilderItem = {
        id: createItemId(),
        type,
        x,
        y,
        w: Math.min(def.defaultSize.w, cols),
        h: def.defaultSize.h,
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
      const cw = rect.width / cols;
      const x = clamp(Math.floor((e.clientX - rect.left) / cw), 0, cols - 1);
      const y = Math.max(0, Math.floor((e.clientY - rect.top) / ROW_HEIGHT_PX));
      setHoverCell({ x, y });
    },
    [cols],
  );

  return (
    <div
      className={css({
        flex: 1,
        overflow: "auto",
        bg: "pageBg",
        padding: 4,
        fontFamily: "mono",
      })}
    >
      <div
        ref={containerRef}
        role="application"
        aria-label="Grid canvas"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setHoverCell(null)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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
          minHeight: `${rows * ROW_HEIGHT_PX}px`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridAutoRows: `${ROW_HEIGHT_PX}px`,
          gap: 0,
          backgroundImage: `linear-gradient(to right, var(--colors-page-border) 1px, transparent 1px), linear-gradient(to bottom, var(--colors-page-border) 1px, transparent 1px)`,
          backgroundSize: `calc(100% / ${cols}) ${ROW_HEIGHT_PX}px`,
          border: "1px solid",
          borderColor: "pageBorder",
        })}
      >
        {hoverCell && drag === null && (
          <div
            className={css({
              gridColumn: `${hoverCell.x + 1} / span 1`,
              gridRow: `${hoverCell.y + 1} / span 1`,
              bg: "pageFg",
              opacity: 0.1,
              pointerEvents: "none",
            })}
          />
        )}
        {items.map((it) => (
          <CanvasItem
            key={it.id}
            item={it}
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
    </div>
  );
}

interface CanvasItemProps {
  item: BuilderItem;
  selected: boolean;
  onSelect(): void;
  onStartDrag(mode: "move" | "resize", e: PointerEvent<HTMLElement>): void;
  onDelete(): void;
}

function CanvasItem({ item, selected, onSelect, onStartDrag, onDelete }: CanvasItemProps) {
  const def = blokDef(item.type);
  const previewText = def ? def.preview(item.data) : item.type;

  return (
    <div
      className={css({
        gridColumn: `${item.x + 1} / span ${item.w}`,
        gridRow: `${item.y + 1} / span ${item.h}`,
        position: "relative",
        border: "1px solid",
        borderColor: selected ? "pageFg" : "pageBorder",
        bg: "pageBg",
        color: "pageFg",
        outline: selected ? "1px solid" : "none",
        outlineColor: "pageFg",
        outlineOffset: "1px",
      })}
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
          all: "unset",
          display: "block",
          width: "100%",
          height: "100%",
          padding: 2,
          boxSizing: "border-box",
          cursor: "move",
          userSelect: "none",
          touchAction: "none",
          overflow: "hidden",
          textAlign: "left",
          color: "pageFg",
        })}
      >
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "sm",
            textTransform: "uppercase",
            opacity: 0.6,
            mb: 1,
          })}
        >
          <span>{def?.label ?? item.type}</span>
          <span>
            {item.w}×{item.h}
          </span>
        </div>
        <div
          className={css({
            fontSize: "sm",
            lineHeight: "tight",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordBreak: "break-word",
          })}
        >
          {previewText}
        </div>
      </button>
      {selected && (
        <>
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
              width: "20px",
              height: "20px",
              border: "1px solid",
              borderColor: "pageFg",
              bg: "pageBg",
              color: "pageFg",
              cursor: "pointer",
              fontSize: "sm",
              lineHeight: 1,
              _hover: { bg: "pageFg", color: "pageBg" },
            })}
            aria-label="Delete"
          >
            ×
          </button>
          <button
            type="button"
            aria-label="Resize"
            onPointerDown={(e) => {
              e.stopPropagation();
              onStartDrag("resize", e);
            }}
            className={css({
              all: "unset",
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "12px",
              height: "12px",
              bg: "pageFg",
              cursor: "se-resize",
              touchAction: "none",
            })}
          />
        </>
      )}
    </div>
  );
}
