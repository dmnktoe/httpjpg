export const WORK_TAG_DATASOURCE_SLUG = "work-tags";

export const WORK_TAG_GROUPS = {
  discipline: "Discipline",
  language: "Language",
  framework: "Framework",
  platform: "Platform",
  tooling: "Tooling",
  kind: "Kind",
} as const;

export type WorkTagGroup = keyof typeof WORK_TAG_GROUPS;

export interface WorkTag {
  /** Stored in Storyblok and compared by the ranker. Never rename one. */
  value: string;
  /** What a visitor reads. Authored casing is the point — `iOS`, not `ios`. */
  label: string;
  group: WorkTagGroup;
}

function tags(group: WorkTagGroup, entries: Record<string, string>): WorkTag[] {
  return Object.entries(entries).map(([value, label]) => ({ value, label, group }));
}

/**
 * The controlled vocabulary. Three spellings of "TypeScript" are three tags to
 * a ranker and one to a human, which is why an editor picks from this list
 * rather than typing. Adding an entry means running `sync:datasources`.
 */
export const WORK_TAGS: readonly WorkTag[] = [
  ...tags("discipline", {
    frontend: "Frontend",
    backend: "Backend",
    "full-stack": "Full Stack",
    "ui-design": "UI Design",
    "ux-design": "UX Design",
    "art-direction": "Art Direction",
    branding: "Branding",
    typography: "Typography",
    editorial: "Editorial",
    motion: "Motion",
    "3d": "3D",
    illustration: "Illustration",
    photography: "Photography",
    "sound-design": "Sound Design",
    accessibility: "Accessibility",
    performance: "Performance",
  }),
  ...tags("language", {
    typescript: "TypeScript",
    javascript: "JavaScript",
    swift: "Swift",
    python: "Python",
    php: "PHP",
    rust: "Rust",
    go: "Go",
    css: "CSS",
    html: "HTML",
    sql: "SQL",
    shell: "Shell",
    glsl: "GLSL",
  }),
  ...tags("framework", {
    react: "React",
    "next-js": "Next.js",
    "react-native": "React Native",
    swiftui: "SwiftUI",
    "node-js": "Node.js",
    astro: "Astro",
    vue: "Vue",
    svelte: "Svelte",
    "tailwind-css": "Tailwind CSS",
    "panda-css": "Panda CSS",
    "three-js": "Three.js",
    gsap: "GSAP",
    "framer-motion": "Framer Motion",
  }),
  ...tags("platform", {
    web: "Web",
    ios: "iOS",
    macos: "macOS",
    android: "Android",
    desktop: "Desktop",
    cli: "CLI",
    print: "Print",
    installation: "Installation",
  }),
  ...tags("tooling", {
    figma: "Figma",
    storyblok: "Storyblok",
    sanity: "Sanity",
    contentful: "Contentful",
    vercel: "Vercel",
    docker: "Docker",
    postgres: "PostgreSQL",
    supabase: "Supabase",
    cloudflare: "Cloudflare",
    "github-actions": "GitHub Actions",
    playwright: "Playwright",
    storybook: "Storybook",
    turborepo: "Turborepo",
    ableton: "Ableton",
  }),
  ...tags("kind", {
    "client-work": "Client Work",
    personal: "Personal",
    "open-source": "Open Source",
    experiment: "Experiment",
    "case-study": "Case Study",
    collaboration: "Collaboration",
    "student-work": "Student Work",
  }),
];

const BY_VALUE = new Map<string, WorkTag>(WORK_TAGS.map((tag) => [tag.value, tag]));

const CATALOG_INDEX = new Map<string, number>(WORK_TAGS.map((tag, index) => [tag.value, index]));

const GROUP_ORDER = new Map<WorkTagGroup, number>(
  (Object.keys(WORK_TAG_GROUPS) as WorkTagGroup[]).map((group, index) => [group, index]),
);

export function workTagByValue(value: string): WorkTag | undefined {
  return BY_VALUE.get(value);
}

/**
 * Values outside the vocabulary are dropped rather than rendered as a raw
 * slug, which is what makes retiring a tag safe: stories still carrying it
 * simply stop showing it.
 */
export function resolveWorkTags(values: readonly string[] | undefined): WorkTag[] {
  if (!values?.length) {
    return [];
  }

  const seen = new Set<string>();
  const resolved: WorkTag[] = [];
  for (const value of values) {
    const tag = BY_VALUE.get(value);
    if (tag && !seen.has(tag.value)) {
      seen.add(tag.value);
      resolved.push(tag);
    }
  }

  return resolved.sort(
    (a, b) =>
      (GROUP_ORDER.get(a.group) ?? 0) - (GROUP_ORDER.get(b.group) ?? 0) ||
      (CATALOG_INDEX.get(a.value) ?? 0) - (CATALOG_INDEX.get(b.value) ?? 0),
  );
}

export function workTagLabels(values: readonly string[] | undefined): string[] {
  return resolveWorkTags(values).map((tag) => tag.label);
}

export function workTagDatasourceEntries(): Array<{ name: string; value: string }> {
  return WORK_TAGS.map((tag) => ({
    name: `${WORK_TAG_GROUPS[tag.group]} · ${tag.label}`,
    value: tag.value,
  }));
}
