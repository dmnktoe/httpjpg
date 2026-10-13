import { css } from "styled-system/css";

import { fieldCss, labelCss } from "./inspector-field-css";

export function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange(v: number): void;
}) {
  return (
    <label className={labelCss}>
      <span className={css({ opacity: 0.6 })}>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        aria-label={label}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
        className={fieldCss}
      />
    </label>
  );
}
