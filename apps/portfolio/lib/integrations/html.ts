const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-fA-F]+|\w+);/g, (match, entity: string) => {
    if (entity[0] === "#") {
      const codePoint =
        entity[1].toLowerCase() === "x"
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
        return match;
      }
      return String.fromCodePoint(codePoint);
    }
    return entity in NAMED_ENTITIES ? NAMED_ENTITIES[entity] : match;
  });
}
