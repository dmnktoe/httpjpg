"use client";

import { css } from "styled-system/css";

import { blokPlugin } from "./bloks";
import type { BuilderItem } from "./lib";

interface BlokPreviewProps {
  item: BuilderItem;
}

export function BlokPreview({ item }: BlokPreviewProps) {
  const plugin = blokPlugin(item.type);
  const node = plugin ? plugin.preview(item.data) : <span>{item.type}</span>;
  return (
    <div
      className={css({
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      })}
    >
      {node}
    </div>
  );
}
