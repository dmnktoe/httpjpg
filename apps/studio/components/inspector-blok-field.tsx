"use client";

import { useState } from "react";
import { css } from "styled-system/css";

import { AssetPicker, StoryPicker } from "./asset-picker";
import { fieldCss, fieldInline, labelCss } from "./inspector-field-css";
import { SelectField } from "./inspector-select-field";
import type { FieldDef } from "./lib";

interface BlokFieldProps {
  field: FieldDef;
  value: unknown;
  onChange(v: unknown): void;
}

interface PickableFieldProps extends BlokFieldProps {
  kind: "asset" | "story";
}

export function BlokField({ field, value, onChange }: BlokFieldProps) {
  switch (field.type) {
    case "textarea":
      return (
        <label className={labelCss}>
          <span className={css({ opacity: 0.6 })}>{field.label}</span>
          <textarea
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            aria-label={field.label}
            className={fieldCss}
          />
        </label>
      );
    case "number":
      return (
        <label className={labelCss}>
          <span className={css({ opacity: 0.6 })}>{field.label}</span>
          <input
            type="number"
            value={Number(value ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={field.label}
            className={fieldCss}
          />
        </label>
      );
    case "boolean":
      return (
        <label className={css({ display: "flex", alignItems: "center", gap: 2 })}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            aria-label={field.label}
          />
          <span>{field.label}</span>
        </label>
      );
    case "select":
      return (
        <SelectField
          label={field.label}
          value={String(value ?? "")}
          options={field.options ?? []}
          onChange={onChange}
        />
      );
    case "assetUrl":
      return <PickableField field={field} value={value} onChange={onChange} kind="asset" />;
    case "storyUuid":
      return <PickableField field={field} value={value} onChange={onChange} kind="story" />;
    case "text":
    default:
      return (
        <label className={labelCss}>
          <span className={css({ opacity: 0.6 })}>{field.label}</span>
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            aria-label={field.label}
            className={fieldCss}
          />
        </label>
      );
  }
}

function PickableField({ field, value, onChange, kind }: PickableFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <label className={labelCss}>
      <span className={css({ opacity: 0.6 })}>{field.label}</span>
      <div className={css({ display: "flex", gap: 1 })}>
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          aria-label={field.label}
          placeholder={kind === "asset" ? "https://..." : "uuid"}
          className={css({ flex: 1, ...fieldInline })}
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={css({
            padding: "1px 8px",
            color: "pageFg",
            fontFamily: "mono",
            fontSize: "sm",
            bg: "pageBg",
            border: "1px solid",
            borderColor: "pageBorder",
            cursor: "pointer",
            _hover: { color: "pageBg", bg: "pageFg" },
          })}
        >
          Browse
        </button>
      </div>
      {kind === "asset" && (
        <AssetPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onPick={(asset) => {
            onChange(asset.filename);
            setPickerOpen(false);
          }}
        />
      )}
      {kind === "story" && (
        <StoryPicker
          open={pickerOpen}
          startsWith={field.storyStartsWith}
          onClose={() => setPickerOpen(false)}
          onPick={(story) => {
            onChange(story.uuid);
            setPickerOpen(false);
          }}
        />
      )}
    </label>
  );
}
