import { Box } from "../box/box";
import { HStack } from "../stack/stack";

export function WorkCardTags({ tags }: { tags: string[] }) {
  // Storyblok's tag_list isn't enforced unique. Dedup so React keys don't collide.
  const uniqueTags = [...new Set(tags)];
  return (
    <HStack
      gap="2"
      css={{
        flexWrap: "wrap",
        mt: "2",
        opacity: 0.7,
        fontFamily: "mono",
        fontSize: "xs",
        letterSpacing: "0.05em",
      }}
    >
      {uniqueTags.map((tag) => (
        <Box
          key={tag}
          as="span"
          css={{
            px: "1.5",
            py: "0.5",
            textTransform: "lowercase",
            border: "1px solid",
            borderColor: "neutral.400",
          }}
        >
          #{tag}
        </Box>
      ))}
    </HStack>
  );
}
