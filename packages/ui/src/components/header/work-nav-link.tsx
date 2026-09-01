import { formatYear } from "../../lib/format";
import { Box } from "../box/box";
import { NavLink } from "../nav-link/nav-link";
import { WorkAccentSwatch } from "../work-accent-swatch/work-accent-swatch";
import { Favicon } from "./favicon";
import type { WorkItem } from "./header";

interface WorkNavLinkProps {
  work: WorkItem;
  variant: "projects" | "websites";
}

const DRAFT_PADDING = {
  projects: "2px 4px",
  websites: "0 4px",
} as const;

export function WorkNavLink({ work, variant }: WorkNavLinkProps) {
  const year = formatYear(work.date);

  return (
    <NavLink
      variant={variant}
      href={work.isExternal ? work.slug : `/work/${work.slug}`}
      isExternal={work.isExternal}
      showExternalIcon={work.isExternal}
      data-preview-image={work.imageUrl}
      css={{
        ...WORK_LINK_FLEX,
        backgroundColor: work.isDraft ? "warning.200" : "transparent",
        color: work.isDraft ? "black" : "inherit",
        ...(work.isDraft && { padding: DRAFT_PADDING[variant] }),
      }}
    >
      <Box as="span" css={WORK_LABEL_STYLES}>
        {work.isDraft && "[DRAFT] "}
        {year && (
          <Box as="span" css={{ fontStyle: "italic" }}>
            {year}{" "}
          </Box>
        )}
        <WorkAccentSwatch
          color={work.accentColor}
          css={{ display: { base: "none", md: "inline-block" } }}
        />
        <Favicon href={work.externalUrl ?? (work.isExternal ? work.slug : "")} />
        {work.title}
      </Box>
    </NavLink>
  );
}

const WORK_LINK_FLEX = {
  display: "flex",
  alignItems: "center",
} as const;

const WORK_LABEL_STYLES = {
  minWidth: 0,
  flex: "1 1 auto",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;
