"use client";

import { useCallback, useEffect, useState } from "react";

import { Box } from "../box/box";
import { HStack } from "../stack/stack";
import { TagButton } from "../tag/tag-button";

export interface WorkTagFilterProps {
  scopeSelector?: string;
}

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
  const toggle = useCallback(
    (tag: string) => setActive((current) => (current === tag ? null : tag)),
    [],
  );

  if (tags.length === 0) {
    return null;
  }

  return (
    <Box css={{ mb: "4" }}>
      <HStack gap="2" css={{ flexWrap: "wrap" }}>
        <TagButton isActive={!active} showMarker={false} onClick={clear}>
          all
        </TagButton>
        {tags.map((tag) => (
          <TagButton key={tag} isActive={active === tag} onClick={() => toggle(tag)}>
            {tag}
          </TagButton>
        ))}
      </HStack>
    </Box>
  );
}
