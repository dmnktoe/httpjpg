import { isMarginSide } from "@httpjpg/storyblok-utils";
import { css } from "styled-system/css";

import { SelectField } from "./inspector-select-field";
import { MARGIN_OPTIONS, SPACING_OPTIONS, type SpacingSet, type SpacingSide } from "./lib";

const SIDE_ROWS: { label: string; sides: [SpacingSide, SpacingSide] }[] = [
  { label: "Top / Bottom", sides: ["mt", "mb"] },
  { label: "Left / Right", sides: ["ml", "mr"] },
];

export function SpacingPair({
  legend,
  ownSet,
  inherited,
  prefix,
  onChange,
}: {
  legend: string;
  ownSet: SpacingSet;
  inherited: SpacingSet;
  prefix: "m" | "p";
  onChange(side: SpacingSide, value: string): void;
}) {
  return (
    <fieldset
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: 1,
        padding: 2,
        border: "1px solid",
        borderColor: "pageBorder",
      })}
    >
      <legend className={css({ opacity: 0.6, fontSize: "sm", textTransform: "uppercase" })}>
        {legend}
      </legend>
      {SIDE_ROWS.map(({ label, sides }) => {
        const [a, b] = sides.map((s) => `${prefix}${s.slice(1)}` as SpacingSide) as [
          SpacingSide,
          SpacingSide,
        ];
        return (
          <div
            key={label}
            className={css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 })}
          >
            <SpacingField side={a} ownSet={ownSet} inherited={inherited} onChange={onChange} />
            <SpacingField side={b} ownSet={ownSet} inherited={inherited} onChange={onChange} />
          </div>
        );
      })}
    </fieldset>
  );
}

function SpacingField({
  side,
  ownSet,
  inherited,
  onChange,
}: {
  side: SpacingSide;
  ownSet: SpacingSet;
  inherited: SpacingSet;
  onChange(side: SpacingSide, value: string): void;
}) {
  const own = ownSet[side] ?? "";
  const inheritedValue = inherited[side];
  const hint = !own && inheritedValue ? `↑ ${inheritedValue}` : undefined;
  return (
    <SelectField
      label={SIDE_LABEL[side]}
      value={own}
      options={isMarginSide(side) ? MARGIN_OPTIONS : SPACING_OPTIONS}
      onChange={(v) => onChange(side, v)}
      hint={hint}
    />
  );
}

const SIDE_LABEL: Record<SpacingSide, string> = {
  mt: "Top",
  mb: "Bottom",
  ml: "Left",
  mr: "Right",
  pt: "Top",
  pb: "Bottom",
  pl: "Left",
  pr: "Right",
};
