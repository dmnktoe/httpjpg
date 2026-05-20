import type { ReactNode } from "react";

import { Box } from "../box/box";
import { Paragraph } from "../paragraph/paragraph";
import { VStack } from "../stack/stack";
import { WorkCardMeta } from "./work-card-meta";
import { WorkCardTags } from "./work-card-tags";

export function WorkCardContent({
  description,
  date,
  dateEnd,
  slug,
  baseUrl,
  tags,
}: {
  description?: ReactNode;
  date?: string | Date;
  dateEnd?: string | Date;
  slug: string;
  baseUrl: string;
  tags?: string[];
}) {
  return (
    <Box css={{ w: { base: "full", xl: "1/2" } }}>
      <VStack
        gap="4"
        css={{
          mx: "auto",
          w: { base: "full", md: "12/12", xl: "full" },
        }}
      >
        {description && (
          <Paragraph
            as="div"
            size="sm"
            css={
              {
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: { base: 5, xl: "none" },
                WebkitBoxOrient: "vertical",
                "& p": {
                  marginTop: 0,
                  marginBottom: "0.75em",
                },
                "& p:last-child": {
                  marginBottom: 0,
                },
              } as any
            }
          >
            {description}
          </Paragraph>
        )}
        <Box>
          <WorkCardMeta date={date} dateEnd={dateEnd} slug={slug} baseUrl={baseUrl} />
          {tags && tags.length > 0 && <WorkCardTags tags={tags} />}
        </Box>
      </VStack>
    </Box>
  );
}
