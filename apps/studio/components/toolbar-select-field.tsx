import { css } from "styled-system/css";

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange(v: string): void;
}) {
  return (
    <label className={css({ display: "flex", alignItems: "center", gap: 1 })}>
      <span className={css({ opacity: 0.6 })}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={css({
          padding: 1,
          color: "pageFg",
          fontFamily: "mono",
          fontSize: "sm",
          bg: "pageBg",
          border: "1px solid",
          borderColor: "pageBorder",
        })}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label || "—"}
          </option>
        ))}
      </select>
    </label>
  );
}
