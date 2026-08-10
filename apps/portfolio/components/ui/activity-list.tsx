import { Box, Link } from "@httpjpg/ui";

import type { ActivityEntry, ActivityKind } from "@/lib/queries/activity";

export interface ActivityListProps {
  entries: ActivityEntry[];
  /** Prefix each row with its source. Off when a heading already says it. */
  showKind?: boolean;
  /** Shown in place of the list when there is nothing to show. */
  emptyLabel?: string;
}

/** Fixed-width so the titles line up down the page. */
const KIND_LABEL: Record<ActivityKind, string> = {
  work: "work",
  film: "film",
  record: "disc",
  trophy: "trph",
};

export function ActivityList({ entries, showKind = false, emptyLabel }: ActivityListProps) {
  if (entries.length === 0) {
    return emptyLabel ? (
      <Box css={{ opacity: 0.4, fontFamily: "mono", fontSize: "sm" }}>{emptyLabel}</Box>
    ) : null;
  }

  return (
    <Box
      as="ul"
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "2",
        fontFamily: "mono",
        fontSize: "sm",
        listStyle: "none",
      }}
    >
      {entries.map((entry) => (
        <ActivityRow key={entry.id} entry={entry} showKind={showKind} />
      ))}
    </Box>
  );
}

function ActivityRow({ entry, showKind }: { entry: ActivityEntry; showKind: boolean }) {
  const title = entry.href ? (
    <Link
      href={entry.href}
      isExternal={!entry.href.startsWith("/")}
      css={{
        color: "primary.500",
        textDecoration: "none",
        _hover: { textDecoration: "underline" },
      }}
    >
      {entry.title}
    </Link>
  ) : (
    entry.title
  );

  return (
    <Box
      as="li"
      css={{
        display: "grid",
        gridTemplateColumns: showKind
          ? { base: "1fr", sm: "5.5rem 3rem 1fr" }
          : { base: "1fr", sm: "5.5rem 1fr" },
        alignItems: "baseline",
        gap: { base: "0", sm: "3" },
      }}
    >
      <Box as="time" dateTime={entry.date} css={{ opacity: 0.4, whiteSpace: "nowrap" }}>
        {formatDay(entry.date)}
      </Box>
      {showKind && (
        <Box as="span" css={{ opacity: 0.4 }}>
          {KIND_LABEL[entry.kind]}
        </Box>
      )}
      <Box css={{ minW: 0 }}>
        {title}
        {entry.detail && (
          <Box as="span" css={{ opacity: 0.4 }}>
            {" "}
            {entry.detail}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/**
 * `YYYY-MM-DD` in UTC. Rendering on the server means a locale-aware format
 * would be the server's locale, not the reader's, and would differ from what
 * the client would produce — ISO sidesteps both and suits the type anyway.
 */
function formatDay(iso: string): string {
  return iso.slice(0, 10);
}
