import { Box } from "../box/box";
import { CopyrightLabel } from "../copyright-label/copyright-label";
import { ImageOverlay, type OverlayPattern } from "../image-overlay/image-overlay";
import { Image } from "../image/image";
import type { SlideshowImage } from "./lib";
import { SlideshowVideoSlide } from "./slideshow-video-slide";

export interface SlideshowSlideProps {
  image: SlideshowImage;
  index: number;
  aspectRatio: string;
  isActive: boolean;
  blurOnLoad: boolean;
  loading: "eager" | "lazy";
  fetchPriority: "auto" | "high";
  sizes?: string;
  overlay: OverlayPattern;
  overlayInset: number;
  holdUntilEnded: boolean;
  onVideoFinished: () => void;
  onVideoUnplayable: (videoUrl: string) => void;
  onReady?: () => void;
}

export function SlideshowSlide({
  image,
  index,
  aspectRatio,
  isActive,
  blurOnLoad,
  loading,
  fetchPriority,
  sizes,
  overlay,
  overlayInset,
  holdUntilEnded,
  onVideoFinished,
  onVideoUnplayable,
  onReady,
}: SlideshowSlideProps) {
  return (
    <Box
      css={{
        position: "relative",
        w: "full",
        h: "full",
      }}
    >
      {image.videoUrl ? (
        <>
          <SlideshowVideoSlide
            videoUrl={image.videoUrl}
            videoPoster={image.videoPoster}
            aspectRatio={aspectRatio}
            holdUntilEnded={holdUntilEnded}
            isActive={isActive}
            onFinished={onVideoFinished}
            onUnplayable={onVideoUnplayable}
            onReady={onReady}
          />
          {(image.copyright || image.copyrightSource) && (
            <CopyrightLabel
              text={image.copyright}
              source={image.copyrightSource}
              position={image.copyrightPosition || "inline-black"}
            />
          )}
        </>
      ) : (
        <Image
          src={image.url}
          srcSet={image.srcSet}
          sizes={sizes}
          alt={image.alt}
          aspectRatio={aspectRatio}
          objectFit="cover"
          copyright={image.copyright}
          copyrightSource={image.copyrightSource}
          copyrightPosition={image.copyrightPosition || "inline-white"}
          blurOnLoad={blurOnLoad}
          loading={loading}
          fetchPriority={fetchPriority}
          onReady={onReady}
        />
      )}
      {overlay !== "none" && !image.videoUrl && (
        <ImageOverlay
          pattern={overlay}
          seed={image.url || image.alt || `slide-${index}`}
          color="white"
          opacity={0.85}
          inset={overlayInset}
        />
      )}
    </Box>
  );
}
