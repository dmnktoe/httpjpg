"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

import { Box } from "../box/box";

const INITIAL_WORK_COUNT = 5;

export function ExpandableLinks<T>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const [linksPathname, setLinksPathname] = useState(pathname);
  if (pathname !== linksPathname) {
    setLinksPathname(pathname);
    setIsExpanded(false);
  }
  const initial = items.slice(0, INITIAL_WORK_COUNT);
  const extras = items.slice(INITIAL_WORK_COUNT);
  const remaining = extras.length;

  return (
    <Box css={{ position: "relative" }}>
      {initial.map(renderItem)}
      {remaining > 0 && (
        <Box css={{ position: "relative" }}>
          <Box
            as="button"
            type="button"
            onClick={() => setIsExpanded(true)}
            aria-hidden={isExpanded}
            tabIndex={isExpanded ? -1 : 0}
            css={{
              ...toggleStyles,
              visibility: isExpanded ? "hidden" : "visible",
            }}
          >
            {`▾ more (${remaining})`}
          </Box>
          {isExpanded && (
            <Box css={{ position: "absolute", top: 0, right: 0, left: 0 }}>
              {extras.map(renderItem)}
              <Box
                as="button"
                type="button"
                onClick={() => setIsExpanded(false)}
                css={toggleStyles}
              >
                ▴ less
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

const toggleStyles = {
  display: "block",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "inherit",
  font: "inherit",
  fontFamily: "sans",
  py: "2px",
  px: "2px",
  opacity: 0.7,
  textAlign: "left",
  _hover: { opacity: 1, textDecoration: "underline" },
} as const;
