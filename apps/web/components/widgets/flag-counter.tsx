"use client";

import { Box } from "@httpjpg/ui";

/**
 * Flag Counter Widget
 * Retro-style visitor counter showing flags from different countries
 */
export const FlagCounter = () => {
  return (
    <Box as="span">
      <a href="https://info.flagcounter.com/ncez">
        {/* biome-ignore lint/performance/noImgElement: External FlagCounter widget */}
        <img
          src="https://s01.flagcounter.com/count2/ncez/bg_FFFFFF/txt_000000/border_CCCCCC/columns_3/maxflags_9/viewers_0/labels_0/pageviews_1/flags_0/percent_0/"
          alt="Flag Counter"
          style={{ border: 0 }}
        />
      </a>
    </Box>
  );
};
