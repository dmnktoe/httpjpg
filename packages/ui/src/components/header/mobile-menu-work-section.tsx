"use client";

import type { ReactNode } from "react";

import { formatYear } from "../../lib/format";
import { Box } from "../box/box";
import { NavLink } from "../nav-link/nav-link";
import type { NavClickPayload, WorkItem } from "./header";

interface MobileMenuWorkSectionProps {
  heading: ReactNode;
  works: WorkItem[];
  variant: "projects" | "websites";
  emptyState: ReactNode;
  onItemClick: () => void;
  onNavClick?: (payload: NavClickPayload) => void;
}

export function MobileMenuWorkSection({
  heading,
  works,
  variant,
  emptyState,
  onItemClick,
  onNavClick,
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
                showExternalIcon={work.isExternal}
                onClick={() => {
                  onNavClick?.({
                    label: work.title,
                    href,
                    source: "mobile",
                    kind: "work",
                    variant,
                    slug: work.slug,
                    ...(work.isExternal ? { external: true } : {}),
                  });
                  onItemClick();
                }}
                data-preview-image={work.imageUrl}
                css={{
                  backgroundColor: work.isDraft ? "warning.200" : "transparent",
                  color: work.isDraft ? "black" : "inherit",
                  ...(work.isDraft && {
                    padding: variant === "projects" ? "2px 4px" : "0 4px",
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
