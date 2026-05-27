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
        pointerEvents: "none",
        fontFamily: "mono",
        fontSize: "sm",
      })}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-pressed={open}
        className={css({
          pointerEvents: "auto",
          padding: "2px 10px",
          border: "1px solid",
          borderColor: "pageBorder",
          bg: open ? "pageFg" : "pageBg",
          color: open ? "pageBg" : "pageFg",
          cursor: "pointer",
          fontFamily: "mono",
          fontSize: "sm",
          _hover: { bg: "pageFg", color: "pageBg" },
        })}
      >
        {open ? "Hide JSON" : "Show JSON"}
      </button>
      {open && (
        <div
          className={css({
            pointerEvents: "auto",
            width: "min(520px, 90vw)",
            maxHeight: "50vh",
            overflow: "auto",
            border: "1px solid",
            borderColor: "pageFg",
            bg: "pageBg",
            color: "pageFg",
            padding: 2,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          })}
        >
          <pre
            className={css({
              fontFamily: "mono",
              fontSize: "sm",
              whiteSpace: "pre",
              margin: 0,
            })}
          >
            {json}
          </pre>
        </div>
      )}
    </aside>
  );
}
