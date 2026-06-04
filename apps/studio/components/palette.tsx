"use client";

import { css } from "styled-system/css";

import { BLOK_REGISTRY, type BlokPlugin } from "./lib";

interface PaletteProps {
  onDragStart(blok: BlokPlugin): void;
  onDragEnd(): void;
}

export function Palette({ onDragStart, onDragEnd }: PaletteProps) {
  const grouped = BLOK_REGISTRY.reduce<Record<string, BlokPlugin[]>>((acc, b) => {
    (acc[b.group] ||= []).push(b);
    return acc;
  }, {});

  return (
    <aside
      className={css({
        flexShrink: 0,
        width: "200px",
        padding: 3,
        fontFamily: "mono",
        fontSize: "sm",
        borderColor: "pageBorder",
        borderRight: "1px solid",
        overflowY: "auto",
      })}
    >
      <h2
        className={css({
          mb: 3,
          fontSize: "sm",
          fontWeight: "bold",
          letterSpacing: "wide",
          textTransform: "uppercase",
        })}
      >
        Blocks
      </h2>
      {Object.entries(grouped).map(([group, items]) => (
        <section key={group} className={css({ mb: 4 })}>
          <h3 className={css({ mb: 1, opacity: 0.6, fontSize: "sm", textTransform: "uppercase" })}>
            {group}
          </h3>
          <ul className={css({ m: 0, p: 0, listStyle: "none" })}>
            {items.map((blok) => (
              <li key={blok.type}>
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/x-blok-type", blok.type);
                    e.dataTransfer.effectAllowed = "copy";
                    onDragStart(blok);
                  }}
                  onDragEnd={onDragEnd}
                  className={css({
                    width: "100%",
                    mb: 1,
                    padding: 2,
                    color: "pageFg",
                    fontFamily: "mono",
                    fontSize: "sm",
                    textAlign: "left",
                    bg: "pageBg",
                    border: "1px solid",
                    borderColor: "pageBorder",
                    cursor: "grab",
                    _hover: { color: "pageBg", bg: "pageFg" },
                    _active: { cursor: "grabbing" },
                  })}
                >
                  {blok.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}
