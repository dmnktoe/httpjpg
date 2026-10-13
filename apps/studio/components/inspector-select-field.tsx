import { css } from "styled-system/css";

import { fieldCss, labelCss } from "./inspector-field-css";

export function SelectField({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange(v: string): void;
  hint?: string;
}) {
  return (
    <label className={labelCss}>
      <span className={css({ display: "flex", justifyContent: "space-between", opacity: 0.6 })}>
        <span>{label}</span>
        {hint && <span className={css({ opacity: 0.6 })}>{hint}</span>}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldCss}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
