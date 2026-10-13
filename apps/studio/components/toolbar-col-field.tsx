import { css } from "styled-system/css";

import { GRID_COLS } from "./lib";

export function ColField({
  label,
  value,
  active,
  onChange,
}: {
  label: string;
  value: number;
  active?: boolean;
  onChange(v: number): void;
}) {
  return (
    <label
      className={css({ display: "flex", alignItems: "center", gap: 1 })}
      style={{ opacity: active ? 1 : 0.6 }}
    >
      <span>{label}</span>
      <input
        type="number"
        min={1}
        max={GRID_COLS}
        value={value}
        aria-label={label}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v) && v >= 1 && v <= GRID_COLS) onChange(v);
        }}
        className={css({
          width: "40px",
          padding: 1,
          color: "pageFg",
          fontFamily: "mono",
          fontSize: "sm",
          bg: "pageBg",
          border: "1px solid",
          borderColor: "pageBorder",
        })}
      />
    </label>
  );
}
