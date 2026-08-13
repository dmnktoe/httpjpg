import { HStack } from "../stack/stack";
import { Tag } from "../tag/tag";

export function WorkCardTags({ tags }: { tags: string[] }) {
  // Storyblok's tag_list isn't enforced unique. Dedup so React keys don't collide.
  const uniqueTags = [...new Set(tags)];
  return (
    <HStack gap="2" css={{ flexWrap: "wrap", mt: "2" }}>
      {uniqueTags.map((tag) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </HStack>
  );
}
