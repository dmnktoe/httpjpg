import type { BlockDef } from "../lib/block";
import { field, tabbed } from "../lib/fields";
import { inlineOptions, OVERLAY_PATTERN_OPTIONS } from "../lib/options";
import { withSpacing } from "../lib/spacing";

const COPYRIGHT_POSITION_OPTIONS = [
  { name: "Inline White", value: "inline-white" },
  { name: "Inline Black", value: "inline-black" },
  { name: "Overlay", value: "overlay" },
  { name: "Below", value: "below" },
];

const FETCH_PRIORITY_OPTIONS = [
  { name: "Auto", value: "auto" },
  { name: "High (LCP)", value: "high" },
  { name: "Low", value: "low" },
];

const SLIDESHOW_EFFECTS = ["slide", "fade", "cube", "coverflow", "flip", "cards", "creative"];

const SLIDESHOW_ANIMATIONS = [
  { name: "None", value: "none" },
  { name: "Fade In", value: "fadeIn" },
  { name: "Zoom In", value: "zoomIn" },
  { name: "Slide In Left", value: "slideInFromLeft" },
  { name: "Slide In Right", value: "slideInFromRight" },
  { name: "Slide Up", value: "slideUp" },
  { name: "Slide Down", value: "slideDown" },
];

const VIDEO_SOURCES = [
  { name: "Native", value: "native" },
  { name: "YouTube", value: "youtube" },
  { name: "Vimeo", value: "vimeo" },
];

export const mediaBlocks: BlockDef[] = [
  {
    name: "image",
    display_name: "Image",
    group: "Media",
    icon: "block-image",
    color: "#38b2ac",
    schema: withSpacing({
      image: field.asset("Image", ["images"], { required: true }),
      alt: field.text("Alt Text", { translatable: true }),
      caption: field.richtext("Caption", { translatable: true }),
      copyrightPosition: field.options("Copyright Position", COPYRIGHT_POSITION_OPTIONS, {
        default_value: "inline-white",
      }),
      ...tabbed("Layout", "layout", {
        aspectRatio: field.options("Aspect Ratio", inlineOptions.aspectRatio),
        width: field.options("Width", inlineOptions.imageWidth, { default_value: "100%" }),
        widthMd: field.options("Width (Tablet)", inlineOptions.imageWidth),
        widthLg: field.options("Width (Desktop)", inlineOptions.imageWidth),
      }),
      ...tabbed("Loading", "loading", {
        isLoadingEager: field.boolean("Eager Loading"),
        fetchPriority: field.options("Fetch Priority", FETCH_PRIORITY_OPTIONS, {
          default_value: "auto",
        }),
        blurOnLoad: field.boolean("Blur on Load"),
      }),
      ...tabbed("Effects", "effects", {
        overlay: field.options("ASCII Overlay", OVERLAY_PATTERN_OPTIONS, {
          default_value: "random",
        }),
        parallax: field.number("Parallax Speed (0 = off)", { default_value: "0" }),
      }),
    }),
  },
  {
    name: "video",
    display_name: "Video",
    group: "Media",
    icon: "block-video",
    color: "#38b2ac",
    schema: withSpacing({
      video: field.asset("Video File", ["videos"]),
      videoUrl: field.text("Video URL (YouTube/Vimeo)"),
      source: field.options("Source", VIDEO_SOURCES, { default_value: "native" }),
      poster: field.asset("Poster", ["images"]),
      caption: field.richtext("Caption", { translatable: true }),
      copyrightPosition: field.options("Copyright Position", COPYRIGHT_POSITION_OPTIONS, {
        default_value: "inline-white",
      }),
      ...tabbed("Layout", "layout", {
        aspectRatio: field.options("Aspect Ratio", inlineOptions.aspectRatio),
      }),
      ...tabbed("Playback", "playback", {
        controls: field.boolean("Show Controls", "true"),
        autoPlay: field.boolean("Auto Play"),
        loop: field.boolean("Loop"),
        muted: field.boolean("Muted"),
      }),
    }),
  },
  {
    name: "slideshow",
    display_name: "Slideshow",
    group: "Media",
    icon: "block-slideshow",
    color: "#38b2ac",
    schema: withSpacing({
      images: field.multiasset("Images", ["images"], { required: true }),
      aspectRatio: field.options("Aspect Ratio", inlineOptions.aspectRatio),
      ...tabbed("Playback", "playback", {
        effect: field.options("Effect", SLIDESHOW_EFFECTS, { default_value: "slide" }),
        autoplayDelay: field.number("Autoplay Delay (ms)", { default_value: "7000" }),
        speed: field.number("Transition Speed (ms)", { default_value: "300" }),
        showNavigation: field.boolean("Show Navigation", "true"),
      }),
      ...tabbed("Animation", "animation", {
        animation: field.options("Entrance Animation", SLIDESHOW_ANIMATIONS, {
          default_value: "none",
        }),
        animationDelay: field.number("Animation Delay (s)", { default_value: "0" }),
      }),
      ...tabbed("Effects", "effects", {
        overlay: field.options("ASCII Overlay", OVERLAY_PATTERN_OPTIONS, {
          default_value: "random",
        }),
        overlayInset: field.number("Overlay Inset (%, particles inward)", {
          default_value: "0",
        }),
        showCounter: field.boolean("Show Slide Counter (01/04)"),
      }),
    }),
  },
  {
    name: "music_player",
    display_name: "Music Player",
    group: "Media",
    icon: "block-play",
    color: "#38b2ac",
    schema: withSpacing({
      source: field.options(
        "Source",
        [
          { name: "Spotify", value: "spotify" },
          { name: "SoundCloud", value: "soundcloud" },
          { name: "MP3", value: "mp3" },
          { name: "Custom", value: "custom" },
        ],
        { default_value: "spotify" },
      ),
      src: field.text("Source URL", { required: true }),
      title: field.text("Title", { translatable: true }),
      artist: field.text("Artist", { translatable: true }),
      artwork: field.text("Artwork URL"),
      ...tabbed("Display", "display", {
        spotifySize: field.options(
          "Spotify Size",
          [
            { name: "Compact", value: "compact" },
            { name: "Normal", value: "normal" },
          ],
          { default_value: "normal" },
        ),
        showArtwork: field.boolean("Show Artwork", "true"),
        showInfo: field.boolean("Show Info", "true"),
        autoPlay: field.boolean("Auto Play"),
        decoration: field.text("ASCII Decoration", {
          default_value: "･ﾟ⋆ ♪ ♫ ･ﾟ⋆",
          translatable: true,
        }),
        headerText: field.text("Header Text", { translatable: true }),
        footerText: field.text("Footer Text", { translatable: true }),
      }),
    }),
  },
  {
    name: "marquee",
    display_name: "Marquee",
    group: "Media",
    icon: "block-arrows-h",
    color: "#38b2ac",
    schema: withSpacing({
      text: field.text("Text", { required: true, translatable: true }),
      ...tabbed("Motion", "motion", {
        speed: field.number("Speed (s)", { default_value: "20" }),
        direction: field.options(
          "Direction",
          [
            { name: "Left", value: "left" },
            { name: "Right", value: "right" },
          ],
          { default_value: "left" },
        ),
        pauseOnHover: field.boolean("Pause on Hover"),
        repeat: field.number("Repeat", { default_value: "3" }),
        iosStyle: field.boolean("iOS Style Pause"),
        pauseDuration: field.number("Pause Duration (s)", { default_value: "2" }),
      }),
      ...tabbed("Style", "style", {
        bgColor: field.datasource("Background Color", "color-options"),
        textColor: field.datasource("Text Color", "color-options"),
      }),
    }),
  },
];
