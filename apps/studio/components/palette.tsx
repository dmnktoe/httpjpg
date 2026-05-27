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
        width: "200px",
        flexShrink: 0,
        borderRight: "1px solid",
        borderColor: "pageBorder",
        padding: 3,
        overflowY: "auto",
        fontFamily: "mono",
        fontSize: "sm",
      })}
    >
      <h2
        className={css({
          fontSize: "sm",
          fontWeight: "bold",
          textTransform: "uppercase",
          mb: 3,
          letterSpacing: "wide",
        })}
      >
        Blocks
      </h2>
      {Object.entries(grouped).map(([group, items]) => (
        <section key={group} className={css({ mb: 4 })}>
          <h3
            className={css({
              fontSize: "sm",
              textTransform: "uppercase",
              opacity: 0.6,
              mb: 1,
            })}
          >
            {group}
          </h3>
          <ul className={css({ listStyle: "none", p: 0, m: 0 })}>
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
                    textAlign: "left",
                    padding: 2,
                    border: "1px solid",
                    borderColor: "pageBorder",
                    bg: "pageBg",
                    color: "pageFg",
                    cursor: "grab",
                    mb: 1,
                    fontFamily: "mono",
                    fontSize: "sm",
                    _hover: { bg: "pageFg", color: "pageBg" },
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
