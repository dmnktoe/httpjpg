/**
 * Get Storyblok image dimensions from URL
 * @param imageSrc The URL of the Storyblok image
 * @returns An object containing the width and height, or null if invalid
 */
export function getSbImageSize(
  imageSrc: string,
): { width: number; height: number } | null {
  if (imageSrc?.startsWith("http")) {
    const parts = imageSrc.split("/");
    if (parts[5]) {
      const [widthStr, heightStr] = parts[5].split("x");
      return {
        width: Number.parseInt(widthStr, 10),
        height: Number.parseInt(heightStr, 10),
      };
    }
  }
  return null;
}
