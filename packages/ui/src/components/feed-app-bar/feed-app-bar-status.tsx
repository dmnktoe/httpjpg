import { Box } from "../box/box";

/** The iPhone OS status bar over the app bar: carrier, the keynote time, a full battery. */
export function FeedAppBarStatus() {
  return (
    <Box
      aria-hidden="true"
      css={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        h: "1.25rem",
        px: "2",
        color: "white",
        fontFamily: "sans",
        fontSize: "0.6875rem",
        fontWeight: "bold",
        lineHeight: 1,
        bg: "linear-gradient(to bottom, {colors.neutral.800} 0%, {colors.black} 100%)",
        userSelect: "none",
      }}
    >
      <Box as="span" css={{ display: "flex", alignItems: "center", gap: "1" }}>
        <Box as="span" css={{ letterSpacing: "-0.1em" }}>
          ●●●●○
        </Box>
        <span>httpjpg</span>
        <span>3G</span>
      </Box>
      <span>9:41</span>
      <Box as="span" css={{ display: "flex", justifySelf: "end", alignItems: "center", gap: "1" }}>
        <span>100%</span>
        <Box
          as="span"
          css={{
            position: "relative",
            display: "block",
            w: "1.375rem",
            h: "0.625rem",
            p: "1px",
            border: "1px solid {colors.white}",
            borderRadius: "0.1875rem",
            _after: {
              position: "absolute",
              top: "50%",
              right: "-0.1875rem",
              content: '""',
              w: "0.125rem",
              h: "0.3125rem",
              bg: "white",
              borderRadius: "0 1px 1px 0",
              transform: "translateY(-50%)",
            },
          }}
        >
          <Box
            as="span"
            css={{ display: "block", w: "full", h: "full", bg: "white", borderRadius: "1px" }}
          />
        </Box>
      </Box>
    </Box>
  );
}
