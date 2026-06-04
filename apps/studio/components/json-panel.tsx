"use client";

import { useState } from "react";
import { css } from "styled-system/css";

import type { ExportedGrid } from "./lib";

interface JsonPanelProps {
  exported: ExportedGrid;
}

export function JsonPanel({ exported }: JsonPanelProps) {
  const [open, setOpen] = useState(false);
  const json = JSON.stringify(exported, null, 2);

  return (
    <aside
      className={css({
        position: "absolute",
        right: 4,
        bottom: 4,
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 1,
        fontFamily: "mono",
        fontSize: "sm",
        pointerEvents: "none",
      })}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-pressed={open}
        className={css({
          padding: "2px 10px",
          color: open ? "pageBg" : "pageFg",
          fontFamily: "mono",
          fontSize: "sm",
          bg: open ? "pageFg" : "pageBg",
          border: "1px solid",
          borderColor: "pageBorder",
          cursor: "pointer",
          pointerEvents: "auto",
          _hover: { color: "pageBg", bg: "pageFg" },
        })}
      >
        {open ? "Hide JSON" : "Show JSON"}
      </button>
      {open && (
        <div
          className={css({
            width: "min(520px, 90vw)",
            maxHeight: "50vh",
            padding: 2,
            color: "pageFg",
            bg: "pageBg",
            border: "1px solid",
            borderColor: "pageFg",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            pointerEvents: "auto",
            overflow: "auto",
          })}
        >
          <pre
            className={css({ margin: 0, fontFamily: "mono", fontSize: "sm", whiteSpace: "pre" })}
          >
            {json}
          </pre>
        </div>
      )}
    </aside>
  );
}
