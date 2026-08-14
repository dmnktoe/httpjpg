import { Box, Tag } from "@httpjpg/ui";

import type { RelatedWork as RelatedWorkData } from "@/lib/queries/related-work";

import { RelatedWorkGallery } from "./related-work-gallery";
import { RelatedWorkLabel } from "./related-work-label";

export interface RelatedWorkProps extends RelatedWorkData {
  /**
   * Draft mode or `pnpm dev`. An untagged story has nothing to show here and
   * renders nothing at all in production, which looks identical to the feature
   * being switched off — so while previewing, say which of the two it is.
   */
  isPreview?: boolean;
}

export function RelatedWork({ tags, related, isPreview = false }: RelatedWorkProps) {
  if (tags.length === 0 && related.length === 0) {
    return isPreview ? <UntaggedHint /> : null;
  }

  return (
    <Box
      as="section"
      aria-label="Tags and related work"
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "6",
        mt: "12",
        px: { base: "4", md: "8" },
        fontFamily: "mono",
        fontSize: "sm",
      }}
    >
      {tags.length > 0 && <TagRow tags={tags} />}
      {related.length > 0 && <RelatedWorkGallery items={related} />}
    </Box>
  );
}

function TagRow({ tags }: { tags: string[] }) {
  return (
    <Box>
      <RelatedWorkLabel>tagged</RelatedWorkLabel>
      <Box css={{ display: "flex", flexWrap: "wrap", gap: "2", mt: "3" }}>
        {tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Box>
    </Box>
  );
}

function UntaggedHint() {
  return (
    <Box
      as="section"
      data-related-work-hint
      aria-label="Related work diagnostics"
      css={{
        mt: "12",
        px: { base: "4", md: "8" },
        opacity: 0.4,
        fontFamily: "mono",
        fontSize: "xs",
      }}
    >
      <Box as="p">
        related — nothing to show: this story carries no work tags. add them in Storyblok under
        Tags. visible in preview only.
      </Box>
    </Box>
  );
}
