"use client";

import { useCallback, useMemo, useState } from "react";
import { css } from "styled-system/css";

import { Canvas } from "./canvas";
import { Inspector } from "./inspector";
import { type BuilderItem, GRID_COLS, type GridSettings, serializeGrid } from "./lib";
import { Palette } from "./palette";
import { Toolbar } from "./toolbar";

const DEFAULT_SETTINGS: GridSettings = {
  columns: GRID_COLS,
  columnsMd: GRID_COLS,
  columnsLg: GRID_COLS,
  gap: "4",
};

interface GridBuilderProps {
  pushEnabled: boolean;
}

export function GridBuilder({ pushEnabled }: GridBuilderProps) {
  const [items, setItems] = useState<BuilderItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settings, setSettings] = useState<GridSettings>(DEFAULT_SETTINGS);

  const selected = useMemo(
    () => items.find((it) => it.id === selectedId) ?? null,
    [items, selectedId],
  );

  const handleItemChange = useCallback(
    (patch: Partial<BuilderItem>) => {
      if (!selectedId) return;
      setItems((prev) => prev.map((it) => (it.id === selectedId ? { ...it, ...patch } : it)));
    },
    [selectedId],
  );

  const handleDataChange = useCallback(
    (key: string, value: unknown) => {
      if (!selectedId) return;
      setItems((prev) =>
        prev.map((it) =>
          it.id === selectedId ? { ...it, data: { ...it.data, [key]: value } } : it,
        ),
      );
    },
    [selectedId],
  );

  const exported = useMemo(() => serializeGrid(settings, items), [settings, items]);

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        bg: "pageBg",
        color: "pageFg",
      })}
    >
      <Toolbar
        settings={settings}
        onSettingsChange={setSettings}
        exported={exported}
        itemCount={items.length}
        pushEnabled={pushEnabled}
        onClear={() => {
          setItems([]);
          setSelectedId(null);
        }}
      />
      <div className={css({ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 })}>
        <Palette onDragStart={() => {}} onDragEnd={() => {}} />
        <Canvas
          items={items}
          selectedId={selectedId}
          settings={settings}
          onItemsChange={setItems}
          onSelect={setSelectedId}
        />
        <Inspector item={selected} onChange={handleItemChange} onDataChange={handleDataChange} />
      </div>
    </div>
  );
}
