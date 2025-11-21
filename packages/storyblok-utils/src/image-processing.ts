/**
 * Process Storyblok image URL with transformations
 * @param imageSrc - The Storyblok URL of the image
 * @param crop - The dimension of the image crop (e.g., "600x400")
 * @param focus - The focal point from Storyblok (e.g., "348x414:349x415")
 * @param filters - Additional filters (e.g., "blur(10):grayscale()")
 * @returns The processed Storyblok image URL
 * @see https://www.storyblok.com/docs/image-service
 */
export function getProcessedImage(
  imageSrc = "",
  crop = "",
  focus = "",
  filters = "",
): string {
  if (!imageSrc) {
    return "";
  }

  // Get width and height from crop dimension
  const [width, height] = crop.split("x");

  // '/m' converts to webp automatically for supported browsers
  let params = "/m";

  // Default quality 75% for webp
  let imageFilters = "/filters:quality(75)";

  if (crop) {
    params += `/${crop}`;

    // Apply smart cropping with focal point
    if (focus) {
      const [focalX, focalY] = focus.split(":")[0].split("x");
      imageFilters += `:focal(${focalX}x${focalY}:${width}x${height})`;
    }
  }

  // Add additional filters
  if (filters) {
    imageFilters += `:${filters}`;
  }

  return `${imageSrc}${params}${imageFilters}`;
}
