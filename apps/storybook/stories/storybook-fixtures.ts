/**
 * Central mock data and fixtures for Storybook stories
 * Single source of truth for test data across all stories
 */

/**
 * Storyblok Image URLs
 * Consistent test images used throughout stories
 */
export const MOCK_IMAGES = {
  videoStill1:
    "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png",
  videoStill2:
    "https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png",
  videoStill3:
    "https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png",
  portrait:
    "https://a.storyblok.com/f/281211/1500x2000/e04c56fe25/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0225.jpg",
  landscape:
    "https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg",
  outletStore1:
    "https://a.storyblok.com/f/281211/5000x2400/609e58d1fb/outlet-store_slideshow-1.jpg",
  outletStore2:
    "https://a.storyblok.com/f/281211/5000x2400/7de0835b62/outlet-store_slideshow-2.jpg",
  outletStore3:
    "https://a.storyblok.com/f/281211/5000x2400/92dcf912ab/outlet-store_slideshow-3.jpg",
} as const;

/**
 * Helper to generate optimized Storyblok image URLs with transformations
 */
export const getOptimizedImageUrl = (
  baseUrl: string,
  options: {
    width?: number;
    height?: number;
    smart?: boolean;
    quality?: number;
  } = {},
) => {
  const { width = 2000, height = 1125, smart = true, quality = 75 } = options;
  return `${baseUrl}/m/${width}x${height}${smart ? "/smart" : ""}/filters:quality(${quality})`;
};

/**
 * Pre-optimized image URLs for common use cases
 */
export const OPTIMIZED_IMAGES = {
  videoStill1: getOptimizedImageUrl(MOCK_IMAGES.videoStill1),
  videoStill2: getOptimizedImageUrl(MOCK_IMAGES.videoStill2),
  videoStill3: getOptimizedImageUrl(MOCK_IMAGES.videoStill3),
  portrait: getOptimizedImageUrl(MOCK_IMAGES.portrait),
  landscape: getOptimizedImageUrl(MOCK_IMAGES.landscape),
  outletStore1: getOptimizedImageUrl(MOCK_IMAGES.outletStore1),
  outletStore2: getOptimizedImageUrl(MOCK_IMAGES.outletStore2),
  outletStore3: getOptimizedImageUrl(MOCK_IMAGES.outletStore3),
  // Smaller preview versions for cursor hover
  videoStill1Preview: getOptimizedImageUrl(MOCK_IMAGES.videoStill1, {
    width: 600,
    height: 400,
  }),
  videoStill2Preview: getOptimizedImageUrl(MOCK_IMAGES.videoStill2, {
    width: 600,
    height: 400,
  }),
  videoStill3Preview: getOptimizedImageUrl(MOCK_IMAGES.videoStill3, {
    width: 600,
    height: 400,
  }),
  landscapePreview: getOptimizedImageUrl(MOCK_IMAGES.landscape, {
    width: 600,
    height: 400,
  }),
} as const;

/**
 * Mock work items for navigation and work list stories
 */
export const MOCK_WORK_ITEMS = [
  {
    id: "1",
    title: "Outlet Store",
    slug: "outlet-store",
    tags: ["Personal"],
    previewImage: OPTIMIZED_IMAGES.outletStore1,
  },
  {
    id: "2",
    title: "This Wild Beast in the Jungle",
    slug: "this-wild-beast-in-the-jungle",
    tags: ["Personal"],
    previewImage: OPTIMIZED_IMAGES.landscape,
  },
  {
    id: "3",
    title: "Video Project 1",
    slug: "video-project-1",
    tags: ["Client"],
    previewImage: OPTIMIZED_IMAGES.videoStill1,
  },
  {
    id: "4",
    title: "Video Project 2",
    slug: "video-project-2",
    tags: ["Client"],
    previewImage: OPTIMIZED_IMAGES.videoStill2,
  },
  {
    id: "5",
    title: "Video Project 3",
    slug: "video-project-3",
    tags: ["Personal"],
    previewImage: OPTIMIZED_IMAGES.videoStill3,
  },
  {
    id: "6",
    title: "Portrait Series",
    slug: "portrait-series",
    tags: ["Client"],
    previewImage: OPTIMIZED_IMAGES.portrait,
  },
] as const;

/**
 * Mock navigation items
 */
export const MOCK_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Mock rich text content for testing
 */
export const MOCK_RICHTEXT = {
  simple: {
    type: "doc" as const,
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This is a simple paragraph with ",
          },
          {
            type: "text",
            text: "bold text",
            marks: [{ type: "bold" }],
          },
          {
            type: "text",
            text: " and ",
          },
          {
            type: "text",
            text: "italic text",
            marks: [{ type: "italic" }],
          },
          {
            type: "text",
            text: ".",
          },
        ],
      },
    ],
  },
  withHeading: {
    type: "doc" as const,
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [
          {
            type: "text",
            text: "Heading Example",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This is a paragraph following a heading.",
          },
        ],
      },
    ],
  },
} as const;

/**
 * Mock video URLs
 */
export const MOCK_VIDEOS = {
  youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  vimeo: "https://vimeo.com/123456789",
} as const;
