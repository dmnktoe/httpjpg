import type { StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import { StoryblokRichText } from "@httpjpg/storyblok-richtext";
import type { VideoSource } from "@httpjpg/ui";
import { video as VideoComponent } from "@httpjpg/ui";
import { storyblokEditable } from "@storyblok/react/rsc";

export interface SbVideoAssetType {
  id: number;
  filename: string;
  alt?: string;
  title?: string;
}

export interface SbVideoProps {
  blok: {
    _uid: string;
    source: "native" | "youtube" | "vimeo";
    video?: SbVideoAssetType;
    videoUrl?: string;
    youtubeId?: string;
    vimeoId?: string;
    poster?: SbVideoAssetType;
    caption?: StoryblokRichTextProps["data"];
    aspectRatio?: "16/9" | "4/3" | "1/1" | "21/9";
    controls?: boolean;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    copyright?: string;
    copyrightPosition?: "below" | "overlay";
    width?: "full" | "container" | "narrow";
    spacingTop?: string;
    spacingBottom?: string;
  };
}

/**
 * Storyblok Video Component
 * Supports native videos, YouTube and Vimeo embeds
 */
export function SbVideo({ blok }: SbVideoProps) {
  const {
    source = "native",
    video,
    videoUrl,
    youtubeId,
    vimeoId,
    poster,
    caption,
    aspectRatio = "16/9",
    controls = true,
    autoPlay = false,
    loop = false,
    muted = false,
    copyright,
    copyrightPosition = "below",
    width = "full",
    spacingTop,
    spacingBottom,
  } = blok;

  // Determine video source
  let videoSrc = "";
  if (source === "native") {
    videoSrc = video?.filename || videoUrl || "";
  } else if (source === "youtube") {
    videoSrc = youtubeId || videoUrl || "";
  } else if (source === "vimeo") {
    videoSrc = vimeoId || videoUrl || "";
  }

  if (!videoSrc) {
    return null;
  }

  return (
    <div
      {...storyblokEditable(blok)}
      style={{
        marginTop: spacingTop,
        marginBottom: spacingBottom,
        maxWidth:
          width === "full"
            ? "100%"
            : width === "container"
              ? "1200px"
              : "800px",
        marginLeft: width !== "full" ? "auto" : undefined,
        marginRight: width !== "full" ? "auto" : undefined,
      }}
    >
      <VideoComponent
        src={videoSrc}
        source={source as VideoSource}
        poster={poster?.filename}
        aspectRatio={aspectRatio}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        copyright={copyright}
        copyrightPosition={copyrightPosition}
        css={{
          width: "100%",
        }}
      />

      {caption && (
        <div
          style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#666" }}
        >
          <StoryblokRichText data={caption} />
        </div>
      )}
    </div>
  );
}
