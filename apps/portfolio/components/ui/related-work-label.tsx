import { Box } from "@httpjpg/ui";

export function RelatedWorkLabel({ children }: { children: string }) {
  return (
    <Box
      as="h2"
      css={{
        opacity: 0.5,
        fontFamily: "mono",
        fontSize: "xs",
        fontWeight: "normal",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Box>
  );
}
