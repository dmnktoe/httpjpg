"use client";

import { css } from "styled-system/css";

import { PickerShell } from "./picker-shell";
import { usePickerQuery } from "./use-picker-query";

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
  const { items: assets, controls } = usePickerQuery<Asset>({
    open,
    endpoint: "/api/assets",
    itemsKey: "assets",
    perPage: 24,
  });

  if (!open) return null;

  return (
    <PickerShell
      title="Pick Asset"
      searchLabel="Search assets"
      controls={controls}
      onClose={onClose}
    >
      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          alignContent: "start",
          gap: 2,
        })}
      >
        {assets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => onPick(asset)}
            className={css({
              display: "flex",
              flexDirection: "column",
              gap: 1,
              padding: 1,
              border: "1px solid",
              borderColor: "pageBorder",
              cursor: "pointer",
              all: "unset",
              _hover: { borderColor: "pageFg" },
            })}
          >
            <img
              src={`${asset.filename}/m/120x120/smart`}
              alt={asset.alt ?? ""}
              loading="lazy"
              className={css({
                aspectRatio: "1/1",
                width: "100%",
                bg: "pageBorder",
                objectFit: "cover",
              })}
            />
            <span
              className={css({
                opacity: 0.7,
                fontFamily: "mono",
                fontSize: "sm",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
              })}
            >
              {asset.filename.split("/").pop()}
            </span>
          </button>
        ))}
      </div>
    </PickerShell>
  );
}
