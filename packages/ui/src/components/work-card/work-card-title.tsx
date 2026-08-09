import { Box } from "../box/box";
import { Icon } from "../icon/icon";
import type { WorkCardVariant } from "./work-card";

export function WorkCardTitle({ title, variant }: { title: string; variant: WorkCardVariant }) {
  return (
    <Box
      css={{
        width: { base: "full", xl: "1/2" },
        containerType: "inline-size",
        "@supports (mix-blend-mode: difference)": {
          color: "white",
          mixBlendMode: "difference",
        },
      }}
    >
      <Box
        as="h3"
        css={{
          lineHeight: 0.9,
          fontFamily: "headline",
          letterSpacing: "tighter",
          textAlign: { base: "left", md: "justify" },
          textWrap: "balance",
          mt: "-0.60em",
          ...(variant === "compact"
            ? { fontSize: "clamp(1.75rem, 8cqi, 5rem)" }
            : variant === "featured"
              ? { fontSize: "clamp(2.5rem, 22cqi, 14rem)" }
              : {
                  fontSize: {
                    base: "clamp(1.5rem, 7cqi, 3rem)",
                    md: "clamp(1.75rem, 14cqi, 5rem)",
                    lg: "clamp(1.75rem, 17cqi, 5rem)",
                  },
                }),
        }}
      >
        <Icon
          name="arrow-up"
          size="1em"
          css={{
            display: "inline-block",
            mr: "2",
            verticalAlign: "middle",
            transform: "rotate(90deg)",
          }}
        />
        {title}
      </Box>
    </Box>
  );
}
