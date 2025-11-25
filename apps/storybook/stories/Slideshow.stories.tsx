import { Slideshow } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Slideshow component stories
 *
 * Image carousel with Swiper. Supports autoplay, navigation,
 * copyright notices, scroll animations, and slide transitions.
 */
const meta = {
  title: "Components/Slideshow",
  component: Slideshow,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    animation: {
      control: "select",
      options: [
        "none",
        "fadeIn",
        "zoomIn",
        "sharpen",
        "zoomSharpen",
        "slideInFromLeft",
        "slideInFromRight",
        "slideUp",
        "slideDown",
      ],
      description: "Entrance animation type for the entire slideshow",
      table: {
        defaultValue: { summary: "none" },
      },
    },
    effect: {
      control: "select",
      options: [
        "slide",
        "fade",
        "cube",
        "coverflow",
        "flip",
        "cards",
        "creative",
      ],
      description: "Swiper slide transition effect",
      table: {
        defaultValue: { summary: "slide" },
      },
    },
    aspectRatio: {
      control: "text",
      description: "Image aspect ratio",
      table: {
        defaultValue: { summary: "16/9" },
      },
    },
    autoplayDelay: {
      control: { type: "range", min: 1000, max: 10000, step: 1000 },
      description: "Autoplay delay in milliseconds",
      table: {
        defaultValue: { summary: "7000" },
      },
    },
    speed: {
      control: { type: "range", min: 200, max: 2000, step: 100 },
      description: "Transition speed in milliseconds",
      table: {
        defaultValue: { summary: "300" },
      },
    },
    showNavigation: {
      control: "boolean",
      description: "Show navigation arrows",
      table: {
        defaultValue: { summary: "true" },
      },
    },
  },
} satisfies Meta<typeof Slideshow>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleImages = [
  {
    url: "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)",
    alt: "Video still 1",
  },
  {
    url: "https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)",
    alt: "Video still 2",
  },
  {
    url: "https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)",
    alt: "Video still 3",
  },
];

/**
 * Default slideshow with instant transitions
 */
export const Default: Story = {
  args: {
    images: sampleImages,
    speed: 0,
  },
};

/**
 * With entrance animation and smooth slide transitions
 */
export const WithAnimation: Story = {
  args: {
    images: sampleImages,
    animation: "sharpen",
    animationDelay: 0.2,
    speed: 600,
    effect: "slide",
  },
};

/**
 * Single image (no navigation)
 */
export const SingleImage: Story = {
  args: {
    images: [sampleImages[0]],
  },
};

// === Transition Effects ===

/**
 * Fade transition between slides
 */
export const FadeTransition: Story = {
  args: {
    images: sampleImages,
    effect: "fade",
    speed: 800,
    autoplayDelay: 4000,
  },
};

/**
 * Cube 3D transition
 */
export const CubeTransition: Story = {
  args: {
    images: sampleImages,
    effect: "cube",
    speed: 1000,
    autoplayDelay: 5000,
  },
};

/**
 * Coverflow 3D transition
 */
export const CoverflowTransition: Story = {
  args: {
    images: sampleImages,
    effect: "coverflow",
    speed: 600,
    autoplayDelay: 4000,
  },
};

/**
 * Flip 3D transition
 */
export const FlipTransition: Story = {
  args: {
    images: sampleImages,
    effect: "flip",
    speed: 800,
    autoplayDelay: 4000,
  },
};

/**
 * Cards stacked transition
 */
export const CardsTransition: Story = {
  args: {
    images: sampleImages,
    effect: "cards",
    speed: 600,
    autoplayDelay: 4000,
  },
};

/**
 * Creative custom transition
 */
export const CreativeTransition: Story = {
  args: {
    images: sampleImages,
    effect: "creative",
    speed: 800,
    autoplayDelay: 4000,
  },
};

// === Timing & Speed ===

/**
 * Fast autoplay with quick transitions
 */
export const FastAutoplay: Story = {
  args: {
    images: sampleImages,
    autoplayDelay: 2000,
    speed: 400,
  },
};

/**
 * Slow, cinematic transitions
 */
export const SlowTransitions: Story = {
  args: {
    images: sampleImages,
    speed: 1500,
    autoplayDelay: 6000,
    effect: "fade",
  },
};

// === Aspect Ratios ===

/**
 * Square aspect ratio
 */
export const SquareAspect: Story = {
  args: {
    images: sampleImages,
    aspectRatio: "1/1",
  },
};

/**
 * Portrait aspect ratio
 */
export const PortraitAspect: Story = {
  args: {
    images: [
      {
        url: "https://a.storyblok.com/f/281211/1500x2000/e04c56fe25/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0225.jpg/m/2000x1125/smart/filters:quality(75)",
        alt: "Klosterkirche portrait",
      },
      {
        url: "https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg/m/2000x1125/smart/filters:quality(75)",
        alt: "Klosterkirche 2",
      },
    ],
    aspectRatio: "2/3",
  },
};

// === Features ===

/**
 * Without navigation arrows
 */
export const NoNavigation: Story = {
  args: {
    images: sampleImages,
    showNavigation: false,
  },
};

/**
 * With copyright notices - showcasing all 4 position variants
 */
export const WithCopyright: Story = {
  args: {
    images: [
      {
        url: "https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg/m/2000x1125/smart/filters:quality(75)",
        alt: "Klosterkirche - vertical-right (white, rotated)",
        copyright: "Studio XYZ 2024",
        copyrightPosition: "vertical-right",
      },
      {
        url: "https://a.storyblok.com/f/281211/1500x2000/e04c56fe25/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0225.jpg/m/2000x1125/smart/filters:quality(75)",
        alt: "Klosterkirche - inline (black, rotated, no ©)",
        copyright: "John Photographer",
        copyrightPosition: "inline",
      },
      {
        url: "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)",
        alt: "Video still - overlay (gradient bottom)",
        copyright: "Visual Arts Studio",
        copyrightPosition: "overlay",
      },
      {
        url: "https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)",
        alt: "Video still - below (under image)",
        copyright: "Creative Agency",
        copyrightPosition: "below",
      },
    ],
    speed: 600,
  },
};

/**
 * Mixed content with video slide
 */
export const WithVideo: Story = {
  args: {
    images: [
      {
        url: "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)",
        alt: "Video still 1",
      },
      {
        url: "https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)",
        alt: "Image slide",
        videoUrl:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        videoPoster:
          "https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)",
        copyright: "Big Buck Bunny",
      },
      {
        url: "https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)",
        alt: "Video still 3",
      },
    ],
    speed: 600,
    autoplayDelay: 8000,
  },
};
