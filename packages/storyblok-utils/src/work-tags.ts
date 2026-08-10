/**
 * The controlled vocabulary an editor picks work tags from.
 *
 * Free-text tags drift — "TS", "typescript", "Typescript" are three tags to a
 * ranker and one to a human. So the list lives here, gets pushed to Storyblok
 * as a datasource by `sync-datasources`, and the CMS only ever offers these
 * values. Runtime code resolves a stored value back to its label and group.
 *
 * Wired into:
 *  1. `storyblok-sync/scripts/sync-datasources.ts` — emits the datasource.
 *  2. `storyblok-sync/scripts/blocks/pages.ts` — the `tags` field on `work`.
 *  3. `apps/portfolio/lib/queries/search-index.ts` — labels feed search, ask,
 *     and related work.
 *
 * Adding a tag = add it here, run `sync:datasources`. Removing one orphans the
 * value on any story still holding it; `resolveWorkTags` drops unknown values
 * rather than rendering a raw slug.
 */

/** Datasource slug in Storyblok. The `tags` field points at this. */
export const WORK_TAG_DATASOURCE_SLUG = "work-tags";

/** Group order here is the order tags render in. */
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
  /** Stored in Storyblok and used as the ranking key. Stable, never renamed. */
  value: string;
  /** What a visitor reads. */
  label: string;
  group: WorkTagGroup;
}

function tags(group: WorkTagGroup, entries: Record<string, string>): WorkTag[] {
  return Object.entries(entries).map(([value, label]) => ({ value, label, group }));
}

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

const GROUP_ORDER = new Map<WorkTagGroup, number>(
  (Object.keys(WORK_TAG_GROUPS) as WorkTagGroup[]).map((group, index) => [group, index]),
);

export function workTagByValue(value: string): WorkTag | undefined {
  return BY_VALUE.get(value);
}

/**
 * Turn stored values into tags: unknown values dropped, duplicates collapsed,
 * ordered by group then by the order the catalog declares them.
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

  const catalogIndex = new Map(WORK_TAGS.map((tag, index) => [tag.value, index]));
  return resolved.sort(
    (a, b) =>
      (GROUP_ORDER.get(a.group) ?? 0) - (GROUP_ORDER.get(b.group) ?? 0) ||
      (catalogIndex.get(a.value) ?? 0) - (catalogIndex.get(b.value) ?? 0),
  );
}

/** Display labels for stored values. The form search, ask, and cards all read. */
export function workTagLabels(values: readonly string[] | undefined): string[] {
  return resolveWorkTags(values).map((tag) => tag.label);
}

/** Datasource entries for `sync-datasources`, grouped in the editor dropdown. */
export function workTagDatasourceEntries(): Array<{ name: string; value: string }> {
  return WORK_TAGS.map((tag) => ({
    name: `${WORK_TAG_GROUPS[tag.group]} · ${tag.label}`,
    value: tag.value,
  }));
}
