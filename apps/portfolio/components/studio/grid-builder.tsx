"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { css } from "styled-system/css";

import { Canvas } from "./canvas";
import { Inspector } from "./inspector";
import { type BuilderItem, type GridSettings, serializeGrid, type Viewport } from "./lib";
import { Palette } from "./palette";
import { Toolbar } from "./toolbar";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
import { useStudioState } from "./use-studio-state";

interface GridBuilderProps {
  pushEnabled: boolean;
  siteUrl: string;
}

export function GridBuilder({ pushEnabled, siteUrl }: GridBuilderProps) {
  const store = useStudioState();
  const { state } = store;
  const { items, settings, viewport, extraRows } = state;

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId && !items.some((it) => it.id === selectedId)) {
      setSelectedId(null);
    }
  }, [items, selectedId]);

  const setItems = useCallback(
    (next: BuilderItem[] | ((prev: BuilderItem[]) => BuilderItem[])) => {
      store.set((s) => ({
        ...s,
        items: typeof next === "function" ? next(s.items) : next,
      }));
    },
    [store],
  );

  const setSettings = useCallback(
    (next: GridSettings) => store.set((s) => ({ ...s, settings: next })),
    [store],
  );

  const setViewport = useCallback(
    (next: Viewport) => store.set((s) => ({ ...s, viewport: next }), { transient: true }),
    [store],
  );

  const addRows = useCallback(
    (n: number) => store.set((s) => ({ ...s, extraRows: s.extraRows + n })),
    [store],
  );

  const removeRows = useCallback(
    (n: number) => store.set((s) => ({ ...s, extraRows: Math.max(0, s.extraRows - n) })),
    [store],
  );

  const selectedItem = useMemo(
    () => items.find((it) => it.id === selectedId) ?? null,
    [items, selectedId],
  );

  const handleItemChange = useCallback(
    (patch: Partial<BuilderItem>) => {
      if (!selectedId) return;
      setItems((prev) => prev.map((it) => (it.id === selectedId ? { ...it, ...patch } : it)));
    },
    [selectedId, setItems],
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
    [selectedId, setItems],
  );

  const exported = useMemo(() => serializeGrid(settings, items), [settings, items]);

  useKeyboardShortcuts({
    selectedId,
    items,
    settings,
    viewport,
    setItems: (updater) => setItems(updater),
    setSelectedId,
    onUndo: store.undo,
    onRedo: store.redo,
  });

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
        viewport={viewport}
        onViewportChange={setViewport}
        exported={exported}
        itemCount={items.length}
        pushEnabled={pushEnabled}
        siteUrl={siteUrl}
        canUndo={store.canUndo}
        canRedo={store.canRedo}
        onUndo={store.undo}
        onRedo={store.redo}
        onClear={() => {
          store.reset();
          setSelectedId(null);
        }}
      />
      <div className={css({ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 })}>
        <Palette onDragStart={() => {}} onDragEnd={() => {}} />
        <Canvas
          items={items}
          selectedId={selectedId}
          settings={settings}
          viewport={viewport}
          extraRows={extraRows}
          onItemsChange={setItems}
          onSelect={setSelectedId}
          onAddRows={addRows}
          onRemoveRows={removeRows}
        />
        <Inspector
          item={selectedItem}
          onChange={handleItemChange}
          onDataChange={handleDataChange}
        />
      </div>
    </div>
  );
}
