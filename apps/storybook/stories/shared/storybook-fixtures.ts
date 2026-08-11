import { workTagLabels } from "@httpjpg/storyblok-utils";

export const MOCK_IMAGES = {
  videoStill1: "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png",
  videoStill2: "https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png",
  videoStill3: "https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png",
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

function getOptimizedImageUrl(
  baseUrl: string,
  options: {
    width?: number;
    height?: number;
    smart?: boolean;
    quality?: number;
  } = {},
) {
  const { width = 2000, height = 1125, smart = true, quality = 75 } = options;
  return `${baseUrl}/m/${width}x${height}${smart ? "/smart" : ""}/filters:quality(${quality})`;
}

export const OPTIMIZED_IMAGES = {
  videoStill1: getOptimizedImageUrl(MOCK_IMAGES.videoStill1),
  videoStill2: getOptimizedImageUrl(MOCK_IMAGES.videoStill2),
  videoStill3: getOptimizedImageUrl(MOCK_IMAGES.videoStill3),
  portrait: getOptimizedImageUrl(MOCK_IMAGES.portrait),
  landscape: getOptimizedImageUrl(MOCK_IMAGES.landscape),
  outletStore1: getOptimizedImageUrl(MOCK_IMAGES.outletStore1),
  outletStore2: getOptimizedImageUrl(MOCK_IMAGES.outletStore2),
  outletStore3: getOptimizedImageUrl(MOCK_IMAGES.outletStore3),
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

const MOCK_WORK_ITEMS = [
  {
    id: "1",
    title: "Outlet Store",
    slug: "outlet-store",
    date: "2025-02-10",
    tags: ["Projects"],
    previewImage: OPTIMIZED_IMAGES.outletStore1,
  },
  {
    id: "2",
    title: "This Wild Beast in the Jungle",
    slug: "this-wild-beast-in-the-jungle",
    date: "2024-10-11",
    tags: ["Projects"],
    previewImage: OPTIMIZED_IMAGES.landscape,
  },
  {
    id: "3",
    title: "Video Project 1",
    slug: "video-project-1",
    date: "2024-06-01",
    tags: ["Websites"],
    previewImage: OPTIMIZED_IMAGES.videoStill1,
  },
  {
    id: "4",
    title: "Video Project 2",
    slug: "video-project-2",
    date: "2024-03-15",
    tags: ["Websites"],
    previewImage: OPTIMIZED_IMAGES.videoStill2,
  },
  {
    id: "5",
    title: "Video Project 3",
    slug: "video-project-3",
    date: "2023-11-20",
    tags: ["Projects"],
    previewImage: OPTIMIZED_IMAGES.videoStill3,
  },
  {
    id: "6",
    title: "Portrait Series",
    slug: "portrait-series",
    date: "2023-08-10",
    tags: ["Websites"],
    previewImage: OPTIMIZED_IMAGES.portrait,
  },
] as const;

function toHeaderWork(items: typeof MOCK_WORK_ITEMS, tag: string) {
  return items
    .filter((w) => (w.tags as readonly string[]).includes(tag))
    .map((w) => ({
      id: w.id,
      slug: w.slug,
      title: w.title,
      date: w.date,
      imageUrl: w.previewImage,
    }));
}

export const MOCK_HEADER_PROJECTS_WORK = toHeaderWork(MOCK_WORK_ITEMS, "Projects");
export const MOCK_HEADER_WEBSITES_WORK = toHeaderWork(MOCK_WORK_ITEMS, "Websites");

const TAGGED_WORK_SOURCE = [
  {
    title: "Brand Identity",
    description:
      "Comprehensive brand identity system for a modern tech startup. Includes logo design, colour palette, typography, and brand guidelines.",
    date: "2024-03-15",
    slug: "brand-identity",
    tagValues: ["branding", "typography", "figma", "client-work"],
    images: [
      { url: OPTIMIZED_IMAGES.outletStore1, alt: "Outlet Store 1" },
      { url: OPTIMIZED_IMAGES.outletStore2, alt: "Outlet Store 2", copyright: "Studio XYZ" },
    ],
  },
  {
    title: "E-Commerce Redesign",
    description:
      "Complete redesign of an e-commerce platform focusing on user experience, conversion optimisation, and mobile-first design.",
    date: "2024-02-20",
    slug: "ecommerce-redesign",
    tagValues: ["frontend", "typescript", "next-js", "web", "client-work"],
    images: [
      { url: OPTIMIZED_IMAGES.outletStore3, alt: "Outlet Store 3" },
      { url: OPTIMIZED_IMAGES.videoStill1, alt: "Video still 1" },
    ],
  },
  {
    title: "Field Recorder",
    description:
      "A small iOS app for capturing and tagging field recordings, built in SwiftUI over a weekend.",
    date: "2024-01-10",
    slug: "field-recorder",
    tagValues: ["ios", "swift", "swiftui", "sound-design", "personal"],
    images: [{ url: OPTIMIZED_IMAGES.portrait, alt: "Recorder in the field" }],
  },
  {
    title: "Magazine Layout",
    description:
      "Editorial design for a fashion magazine. Clean typography, bold imagery, and modern layout systems.",
    date: "2023-12-05",
    slug: "magazine-layout",
    tagValues: ["editorial", "typography", "print", "client-work"],
    images: [
      { url: OPTIMIZED_IMAGES.videoStill2, alt: "Video still 2" },
      { url: OPTIMIZED_IMAGES.videoStill3, alt: "Video still 3" },
    ],
  },
  {
    title: "Shader Studies",
    description:
      "A series of GLSL experiments exploring noise, feedback, and displacement in the browser.",
    date: "2023-09-18",
    slug: "shader-studies",
    tagValues: ["glsl", "three-js", "web", "experiment", "open-source"],
    images: [{ url: OPTIMIZED_IMAGES.landscape, alt: "Shader output" }],
  },
] as const;

export const MOCK_TAGGED_WORKS = TAGGED_WORK_SOURCE.map((work) => ({
  title: work.title,
  description: work.description,
  date: work.date,
  slug: work.slug,
  images: [...work.images],
  tags: workTagLabels(work.tagValues),
}));

export const MOCK_TAGGED_WORK = MOCK_TAGGED_WORKS[1];

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
  article: {
    type: "doc" as const,
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "The art of brutalist typography" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Brutalist typography rejects polish in favor of presence. The body is set in a humble sans-serif at 12px — small, dense, deliberate. Headlines weigh in with Impact, the chunky condensed grotesque that has anchored every cassette label and gallery poster since the 1980s.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Why constrain the line length?" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Reading comprehension drops when lines stretch beyond ~75 characters. Type designers settled on 45–75 as the comfortable range; this component defaults to ",
          },
          { type: "text", text: "65ch", marks: [{ type: "code" }] },
          { type: "text", text: " when " },
          { type: "text", text: "maxWidth={true}", marks: [{ type: "code" }] },
          {
            type: "text",
            text: ". You can also pass an explicit length (e.g. ",
          },
          { type: "text", text: "80ch", marks: [{ type: "code" }] },
          { type: "text", text: ") or " },
          { type: "text", text: "false", marks: [{ type: "code" }] },
          { type: "text", text: " to remove the constraint entirely." },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Other inline marks" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Try inline " },
          { type: "text", text: "bold", marks: [{ type: "bold" }] },
          { type: "text", text: ", " },
          { type: "text", text: "italic", marks: [{ type: "italic" }] },
          { type: "text", text: ", and " },
          {
            type: "text",
            text: "underline",
            marks: [{ type: "underline" }],
          },
          { type: "text", text: ", plus " },
          {
            type: "text",
            text: "an inline link",
            marks: [
              {
                type: "link",
                attrs: { href: "https://www.httpjpg.com", target: "_blank" },
              },
            ],
          },
          { type: "text", text: " — all preserved by the resolver." },
        ],
      },
      {
        type: "bullet_list",
        content: [
          {
            type: "list_item",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Lists keep their bullet rhythm" }],
              },
            ],
          },
          {
            type: "list_item",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Code marks render with the monospace stack",
                  },
                ],
              },
            ],
          },
          {
            type: "list_item",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Headlines reset to the Impact font" }],
              },
            ],
          },
        ],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Constraint is the parent of style — Massimo Vignelli (paraphrased).",
              },
            ],
          },
        ],
      },
    ],
  },
} as const;
