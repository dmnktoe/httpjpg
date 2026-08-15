"use client";

import { useEffect, useId, useState } from "react";
import { css } from "styled-system/css";

import { Box } from "../box/box";
import { TagButton } from "../tag/tag-button";
import type { WorkTagCount } from "./lib";

export interface WorkTagFilterProps {
  /** Tags to offer with their work counts, already deduplicated and ordered by the caller. */
  tags: WorkTagCount[];
  active: string | null;
  /** Total works behind the "all" chip. Omitted, the chip carries no count. */
  totalCount?: number;
  onChange: (tag: string | null) => void;
  /** Opens the panel on first render instead of hiding it behind the toggle. */
  defaultExpanded?: boolean;
}

const toggleClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  px: "0",
  py: "1",
  color: "inherit",
  fontFamily: "mono",
  fontSize: "xs",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  bg: "transparent",
  border: "none",
  transitionProperty: "opacity",
  transitionDuration: "fast",
  cursor: "pointer",
  _hover: { opacity: 0.6 },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
});

const bracketClass = css({ userSelect: "none" });

const summaryClass = css({ opacity: 0.5, letterSpacing: "0.05em", textTransform: "none" });

/** Names the group for assistive tech; the visible toggle already says "filter". */
const legendClass = css({
  position: "absolute",
  w: "1px",
  h: "1px",
  m: "-1px",
  p: 0,
  whiteSpace: "nowrap",
  overflow: "hidden",
  clipPath: "inset(50%)",
});

export function WorkTagFilter({
  tags,
  active,
  totalCount,
  onChange,
  defaultExpanded = false,
}: WorkTagFilterProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const panelId = `work-tag-filter-${useId().replace(/:/g, "")}`;

  // A deep-linked `?tag=` arrives after the first paint; open the panel so the
  // active chip explains why the list is filtered.
  useEffect(() => {
    if (active) {
      setIsExpanded(true);
    }
  }, [active]);

  if (tags.length === 0) {
    return null;
  }

  // Collapsed with a filter on would otherwise hide the reason the list is
  // short, so the toggle line reports it.
  const summary = active ? `#${active}` : `${tags.length} tags`;

  return (
    <Box css={{ mb: "4" }}>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className={toggleClass}
      >
        <span aria-hidden="true" className={bracketClass}>
          {isExpanded ? "[ − ]" : "[ + ]"}
        </span>
        filter
        <span className={summaryClass}>· {summary}</span>
      </button>

      <Box
        as="fieldset"
        id={panelId}
        hidden={!isExpanded}
        css={{ display: "flex", flexWrap: "wrap", gap: "2", m: 0, mt: "3", p: 0, border: "none" }}
      >
        <Box as="legend" className={legendClass}>
          Filter work by tag
        </Box>
        <TagButton
          showMarker={false}
          isActive={!active}
          count={totalCount}
          onClick={() => onChange(null)}
        >
          all
        </TagButton>
        {tags.map(({ tag, count }) => (
          <TagButton
            key={tag}
            isActive={active === tag}
            count={count}
            onClick={() => onChange(active === tag ? null : tag)}
          >
            {tag}
          </TagButton>
        ))}
      </Box>
    </Box>
  );
}
