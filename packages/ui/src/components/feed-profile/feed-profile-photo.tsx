import { Box } from "../box/box";

export interface FeedProfilePhotoProps {
  /** Shown as its first letter when there is no image. */
  name: string;
  src?: string;
}

/** The profile picture in a white photo frame, the way 2010 apps mounted it. */
export function FeedProfilePhoto({ name, src }: FeedProfilePhotoProps) {
  return (
    <Box
      as="span"
      data-feed-profile-photo=""
      css={{
        display: "block",
        flexShrink: 0,
        w: { base: "5.25rem", md: "6.5rem" },
        h: { base: "5.25rem", md: "6.5rem" },
        p: "0.1875rem",
        bg: "white",
        border: "1px solid {colors.neutral.300}",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.25)",
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "0.3125rem",
          }}
        />
      ) : (
        <Box
          as="span"
          aria-hidden="true"
          css={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            w: "full",
            h: "full",
            color: "white",
            fontFamily: "accent",
            fontSize: { base: "2.5rem", md: "3.25rem" },
            lineHeight: 1,
            bg: "linear-gradient(to bottom, {colors.primary.400} 0%, {colors.primary.500} 50%, {colors.primary.600} 50%, {colors.primary.800} 100%)",
            borderRadius: "0.3125rem",
            textShadow: "0 -1px 0 rgba(0, 0, 0, 0.4)",
          }}
        >
          {name.charAt(0)}
        </Box>
      )}
    </Box>
  );
}
