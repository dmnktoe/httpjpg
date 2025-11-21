import { Slideshow } from "@httpjpg/ui";
import { storyblokEditable } from "@storyblok/react/rsc";
import type { SbImageType } from "../image";

export interface SbSlideshowProps {
  blok: {
    _uid: string;
    images: SbImageType[];
    aspectRatio?: "16/9" | "4/3" | "1/1" | "3/4" | "9/16";
    speed?: number;
    spacingTop?: string;
    spacingBottom?: string;
    width?: "full" | "container" | "narrow";
  };
}

/**
 * Storyblok Slideshow Component
 * Carousel/slideshow of images
 */
export function SbSlideshow({ blok }: SbSlideshowProps) {
  const {
    images,
    aspectRatio = "16/9",
    speed = 1,
    spacingTop,
    spacingBottom,
    width = "full",
  } = blok;

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div
      {...storyblokEditable(blok)}
      style={{
        marginTop: spacingTop,
        marginBottom: spacingBottom,
      }}
    >
      <Slideshow
        images={images.map((img) => ({
          url: img.filename,
          alt: img.alt || img.title || "",
        }))}
        aspectRatio={aspectRatio}
        autoplayDelay={speed * 1000}
        css={{
          width:
            width === "narrow"
              ? "container.sm"
              : width === "container"
                ? "container"
                : "full",
        }}
      />
    </div>
  );
}
