"use client";

import type { ReactNode } from "react";

import { formatYear } from "../../lib/format";
import { Box } from "../box/box";
import { NavLink } from "../nav-link/nav-link";
import type { WorkItem } from "./header";

interface MobileMenuWorkSectionProps {
  heading: ReactNode;
  works: WorkItem[];
  variant: "personal" | "client";
  emptyState: ReactNode;
  onItemClick: () => void;
}

export function MobileMenuWorkSection({
  heading,
  works,
  variant,
  emptyState,
  onItemClick,
}: MobileMenuWorkSectionProps) {
  return (
    <Box>
      <Box as="span" css={{ fontWeight: "bold" }}>
        {heading}
      </Box>
      <br />
      {works.length > 0
        ? works.map((work) => {
            const href = work.isExternal ? work.slug : `/work/${work.slug}`;
            const year = formatYear(work.date);
            return (
              <NavLink
                key={work.id}
                variant={variant}
                href={href}
                isExternal={work.isExternal}
                showExternalIcon={variant === "client" && work.isExternal}
                onClick={onItemClick}
                data-preview-image={work.imageUrl}
                css={{
                  backgroundColor: work.isDraft ? "warning.200" : "transparent",
                  color: work.isDraft ? "black" : "inherit",
                  ...(work.isDraft && {
                    padding: variant === "personal" ? "2px 4px" : "0 4px",
                  }),
                }}
              >
                {work.isDraft && "[DRAFT] "}
                {year && (
                  <Box as="span" css={{ fontStyle: "italic" }}>
                    {year}{" "}
                  </Box>
                )}
                {work.title}
              </NavLink>
            );
          })
        : emptyState}
    </Box>
  );
}
