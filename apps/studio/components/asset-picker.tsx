"use client";

import { useEffect, useState } from "react";
import { css } from "styled-system/css";

interface Asset {
  id: number;
  filename: string;
  alt?: string | null;
}

interface AssetPickerProps {
  open: boolean;
  onClose(): void;
  onPick(asset: Asset): void;
}

export function AssetPicker({ open, onClose, onPick }: AssetPickerProps) {
  const [search, setSearch] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), per_page: "24" });
    if (search) params.set("search", search);
    fetch(`/api/assets?${params}`)
      .then((r) => r.json())
      .then(
        (data: {
          ok?: boolean;
          assets?: Asset[];
          total?: number;
          perPage?: number;
          error?: string;
        }) => {
          if (cancelled) return;
          if (!data.ok) {
            setError(data.error ?? "Unknown error");
          } else {
            setAssets(data.assets ?? []);
            setTotal(data.total ?? 0);
            setPerPage(data.perPage ?? 24);
          }
        },
      )
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, page, search]);

  if (!open) return null;
  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <PickerShell title="Pick Asset" onClose={onClose}>
      <input
        type="search"
        placeholder="Search…"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        className={inputCss}
      />
      {error && <p className={css({ color: "danger.500" })}>{error}</p>}
      {loading && <p className={css({ opacity: 0.6 })}>Loading…</p>}
      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
          alignContent: "start",
        })}
      >
        {assets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => onPick(asset)}
            className={css({
              all: "unset",
              cursor: "pointer",
              border: "1px solid",
              borderColor: "pageBorder",
              padding: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              _hover: { borderColor: "pageFg" },
            })}
          >
            <img
              src={`${asset.filename}/m/120x120/smart`}
              alt={asset.alt ?? ""}
              loading="lazy"
              className={css({
                width: "100%",
                aspectRatio: "1/1",
                objectFit: "cover",
                bg: "pageBorder",
              })}
            />
            <span
              className={css({
                fontSize: "sm",
                fontFamily: "mono",
                opacity: 0.7,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              })}
            >
              {asset.filename.split("/").pop()}
            </span>
          </button>
        ))}
      </div>
      <Pagination page={page} pages={pages} onPage={setPage} />
    </PickerShell>
  );
}

interface Story {
  id: number;
  uuid: string;
  name: string;
  full_slug: string;
}

interface StoryPickerProps {
  open: boolean;
  startsWith?: string;
  onClose(): void;
  onPick(story: Story): void;
}

export function StoryPicker({ open, startsWith, onClose, onPick }: StoryPickerProps) {
  const [search, setSearch] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), per_page: "25" });
    if (search) params.set("search", search);
    if (startsWith) params.set("starts_with", startsWith);
    fetch(`/api/stories?${params}`)
      .then((r) => r.json())
      .then(
        (data: {
          ok?: boolean;
          stories?: Story[];
          total?: number;
          perPage?: number;
          error?: string;
        }) => {
          if (cancelled) return;
          if (!data.ok) {
            setError(data.error ?? "Unknown error");
          } else {
            setStories(data.stories ?? []);
            setTotal(data.total ?? 0);
            setPerPage(data.perPage ?? 25);
          }
        },
      )
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, page, search, startsWith]);

  if (!open) return null;
  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <PickerShell title={`Pick Story${startsWith ? ` (${startsWith}*)` : ""}`} onClose={onClose}>
      <input
        type="search"
        placeholder="Search…"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        className={inputCss}
      />
      {error && <p className={css({ color: "danger.500" })}>{error}</p>}
      {loading && <p className={css({ opacity: 0.6 })}>Loading…</p>}
      <ul
        className={css({
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        })}
      >
        {stories.map((story) => (
          <li key={story.id}>
            <button
              type="button"
              onClick={() => onPick(story)}
              className={css({
                all: "unset",
                cursor: "pointer",
                display: "flex",
                gap: 2,
                padding: 2,
                border: "1px solid",
                borderColor: "pageBorder",
                width: "100%",
                boxSizing: "border-box",
                _hover: { bg: "pageFg", color: "pageBg" },
              })}
            >
              <span className={css({ flex: 1 })}>{story.name}</span>
              <span className={css({ opacity: 0.6, fontFamily: "mono", fontSize: "sm" })}>
                /{story.full_slug}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Pagination page={page} pages={pages} onPage={setPage} />
    </PickerShell>
  );
}

function Pagination({
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
        gap: 2,
        alignItems: "center",
        justifyContent: "center",
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

function PickerShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose(): void;
}) {
  return (
    <div
      className={css({
        position: "fixed",
        inset: 0,
        bg: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      })}
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close picker"
        onClick={onClose}
        className={css({
          all: "unset",
          position: "absolute",
          inset: 0,
          cursor: "default",
        })}
      />
      <dialog
        open
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className={css({
          position: "relative",
          width: "720px",
          maxWidth: "92vw",
          maxHeight: "80vh",
          bg: "pageBg",
          color: "pageFg",
          border: "1px solid",
          borderColor: "pageFg",
          display: "flex",
          flexDirection: "column",
          fontFamily: "mono",
          fontSize: "sm",
          padding: 0,
          margin: 0,
        })}
      >
        <header
          className={css({
            padding: 3,
            borderBottom: "1px solid",
            borderColor: "pageBorder",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          })}
        >
          <strong className={css({ textTransform: "uppercase", letterSpacing: "wide" })}>
            {title}
          </strong>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={css({
              all: "unset",
              cursor: "pointer",
              padding: "0 6px",
              _hover: { bg: "pageFg", color: "pageBg" },
            })}
          >
            ×
          </button>
        </header>
        <div
          className={css({
            padding: 3,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flex: 1,
          })}
        >
          {children}
        </div>
      </dialog>
    </div>
  );
}

const inputCss = css({
  width: "100%",
  padding: 1,
  border: "1px solid",
  borderColor: "pageBorder",
  bg: "pageBg",
  color: "pageFg",
  fontFamily: "mono",
  fontSize: "sm",
});

const btnCss = css({
  padding: "1px 8px",
  border: "1px solid",
  borderColor: "pageBorder",
  bg: "pageBg",
  color: "pageFg",
  fontFamily: "mono",
  fontSize: "sm",
  cursor: "pointer",
  _hover: { bg: "pageFg", color: "pageBg" },
  _disabled: { cursor: "not-allowed", opacity: 0.4, _hover: { bg: "pageBg", color: "pageFg" } },
});
