import { parseWorkAccent } from "../../lib/work-accent";
import { ASCII_TAPE } from "../ascii-art/banners";
import { Box } from "../box/box";
import { Link } from "../link/link";
import { WorkCardDate } from "./work-card-date";

export function WorkCardMeta({
  date,
  dateEnd,
  slug,
  baseUrl,
  accentColor,
}: {
  date?: string | Date;
  dateEnd?: string | Date;
  slug: string;
  baseUrl: string;
  accentColor?: string;
}) {
  const accent = parseWorkAccent(accentColor);
  return (
    <Box>
      {date && <WorkCardDate date={date} dateEnd={dateEnd} />}
      <Box>
        <Link
          href={`${baseUrl}/${slug}`}
          aria-label={slug}
          style={accent ? { color: accent.hex } : undefined}
          css={{
            display: "block",
            color: "primary.500",
            fontSize: "sm",
            textDecoration: "none",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            _hover: { textDecoration: "underline" },
          }}
        >
          <span aria-hidden="true">-̸̨̱̠̳̩̼͙̈̀̀̄̃̆́͠ͅ↳↳↳</span>
          {slug}
          <span aria-hidden="true">↳↳↳</span>
        </Link>
      </Box>
      <Box
        as="span"
        aria-hidden="true"
        css={{
          display: "block",
          mt: "1",
          opacity: 0.25,
          fontFamily: "mono",
          fontSize: "2xs",
          letterSpacing: "0.1em",
        }}
      >
        {ASCII_TAPE}
      </Box>
    </Box>
  );
}
