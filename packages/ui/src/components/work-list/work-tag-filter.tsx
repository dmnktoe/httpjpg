"use client";

import { useCallback, useEffect, useState } from "react";
import { css } from "styled-system/css";

import { Box } from "../box/box";
import { HStack } from "../stack/stack";

export interface WorkTagFilterProps {
  scopeSelector?: string;
}

const buttonClass = css({
  cursor: "pointer",
  bg: "transparent",
  border: "1px solid",
  borderColor: "neutral.300",
  fontFamily: "mono",
  fontSize: "xs",
  letterSpacing: "0.05em",
  px: "2",
  py: "1",
  color: "inherit",
  transition: "all 150ms",
  _hover: {
    borderColor: "neutral.700",
  },
});

const buttonActiveClass = css({
  borderColor: "primary.500",
  color: "primary.500",
});

export function WorkTagFilter({ scopeSelector = "[data-work-list]" }: WorkTagFilterProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const scope = document.querySelector(scopeSelector);
    if (!scope) {
      return;
    }
    const cards = scope.querySelectorAll<HTMLElement>("[data-tags]");
    const seen = new Set<string>();
    cards.forEach((card) => {
      const raw = card.dataset.tags || "";
      raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => seen.add(t));
    });
    setTags([...seen].sort());
  }, [scopeSelector]);

  useEffect(() => {
    const scope = document.querySelector(scopeSelector);
    if (!scope) {
      return;
    }
    const cards = scope.querySelectorAll<HTMLElement>("[data-tags]");
    cards.forEach((card) => {
      const cardTags = (card.dataset.tags || "").split(",").map((t) => t.trim());
      const visible = !active || cardTags.includes(active);
      card.style.display = visible ? "" : "none";
    });
  }, [active, scopeSelector]);

  const clear = useCallback(() => setActive(null), []);

  if (tags.length === 0) {
    return null;
  }

  return (
    <Box css={{ mb: "4" }}>
      <HStack gap="2" css={{ flexWrap: "wrap" }}>
        <button type="button" onClick={clear} className={!active ? buttonActiveClass : buttonClass}>
          all
        </button>
        {tags.map((tag) => (
          <button
            type="button"
            key={tag}
            onClick={() => setActive(tag)}
            className={active === tag ? buttonActiveClass : buttonClass}
          >
            #{tag}
          </button>
        ))}
      </HStack>
    </Box>
  );
}
