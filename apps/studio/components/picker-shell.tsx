"use client";

import { css } from "styled-system/css";

import type { PickerControls } from "./use-picker-query";

interface PickerShellProps {
  title: string;
  searchLabel: string;
  controls: PickerControls;
  children: React.ReactNode;
  onClose(): void;
}

export function PickerShell({ title, searchLabel, controls, children, onClose }: PickerShellProps) {
  return (
    <div
      className={css({
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bg: "rgba(0,0,0,0.4)",
      })}
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close picker"
        onClick={onClose}
        className={css({ position: "absolute", inset: 0, cursor: "default", all: "unset" })}
      />
      <dialog
        open
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className={css({
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "720px",
          maxWidth: "92vw",
          maxHeight: "80vh",
          margin: 0,
          padding: 0,
          color: "pageFg",
          fontFamily: "mono",
          fontSize: "sm",
          bg: "pageBg",
          border: "1px solid",
          borderColor: "pageFg",
        })}
      >
        <header
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 3,
            borderColor: "pageBorder",
            borderBottom: "1px solid",
          })}
        >
          <strong className={css({ letterSpacing: "wide", textTransform: "uppercase" })}>
            {title}
          </strong>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={css({
              padding: "0 6px",
              cursor: "pointer",
              all: "unset",
              _hover: { color: "pageBg", bg: "pageFg" },
            })}
          >
            ×
          </button>
        </header>
        <div
          className={css({
            display: "flex",
            flex: 1,
            flexDirection: "column",
            gap: 2,
            padding: 3,
            overflow: "auto",
          })}
        >
          <input
            type="search"
            aria-label={searchLabel}
            placeholder="Search…"
            value={controls.search}
            onChange={(e) => controls.onSearch(e.target.value)}
            className={inputCss}
          />
          {controls.error && <p className={css({ color: "danger.500" })}>{controls.error}</p>}
          {controls.loading && <p className={css({ opacity: 0.6 })}>Loading…</p>}
          {children}
          <PickerPagination page={controls.page} pages={controls.pages} onPage={controls.onPage} />
        </div>
      </dialog>
    </div>
  );
}

function PickerPagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage(n: number): void;
}) {
  return (
    <div
      className={css({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        padding: 2,
        fontFamily: "mono",
        fontSize: "sm",
      })}
    >
      <button
        type="button"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page <= 1}
        className={btnCss}
      >
        Prev
      </button>
      <span className={css({ opacity: 0.6 })}>
        {page} / {pages}
      </span>
      <button
        type="button"
        onClick={() => onPage(Math.min(pages, page + 1))}
        disabled={page >= pages}
        className={btnCss}
      >
        Next
      </button>
    </div>
  );
}

const inputCss = css({
  width: "100%",
  padding: 1,
  color: "pageFg",
  fontFamily: "mono",
  fontSize: "sm",
  bg: "pageBg",
  border: "1px solid",
  borderColor: "pageBorder",
});

const btnCss = css({
  padding: "1px 8px",
  color: "pageFg",
  fontFamily: "mono",
  fontSize: "sm",
  bg: "pageBg",
  border: "1px solid",
  borderColor: "pageBorder",
  cursor: "pointer",
  _hover: { color: "pageBg", bg: "pageFg" },
  _disabled: { opacity: 0.4, cursor: "not-allowed", _hover: { color: "pageFg", bg: "pageBg" } },
});
