# Coding Agent Guidelines

> Guide for AI coding agents in the httpjpg monorepo. Mirror existing conventions; don't invent new patterns without a strong reason.

Brutalist portfolio site: Storyblok CMS → Next.js 16 App Router → Panda CSS (zero-runtime) → pnpm + Turbo monorepo.

When generating or updating code: read neighboring files first, prefer the existing pattern over an inventive one, keep changes scoped.

## Stack

- **TypeScript** — strict mode, `interface` for object shapes, no `enum`
- **Node.js** ≥ 22.12 (pinned via `.nvmrc` to 24.20.0), ESM-only (`"type": "module"` in every workspace package; the private root `package.json` does not declare it)
- **Next.js 16** App Router — Server Components by default, route handlers in `app/api/*`
- **React 19** — functional components only
- **Panda CSS** (zero-runtime) — `css({})` / `cx()` / token-aware patterns; tokens from `@httpjpg/tokens`
- **Storyblok** — Visual Editor live-bridge in dev, draft mode in production
- **Sentry** — via `@httpjpg/observability` for client / server / edge
- **Vitest** (jsdom by default; `// @vitest-environment node` for node) · **Playwright** for E2E (`apps/portfolio/tests/e2e`) · **Argos** + Storybook Vitest for visual regression
- **oxlint** + **oxfmt** — no ESLint, no Prettier
- **pnpm** workspaces with a catalog · **Turbo** for task orchestration
- **t3-oss/env-nextjs** + **Zod** in `@httpjpg/env`

## Monorepo

```
/
├── apps/
│   ├── portfolio/               # Next.js 16 site (the product)
│   │   ├── app/                 # Routes, layouts, route handlers
│   │   │   ├── (portfolio)/     # Public portfolio route group
│   │   │   ├── api/             # discord, spotify, draft, revalidate, search, ask, …
│   │   │   └── work/feed.xml/   # RSS feed
│   │   ├── components/
│   │   │   ├── providers/       # Consent, Storyblok live, registry init
│   │   │   ├── ui/              # Layout shell (footer, theme sync, work-nav)
│   │   │   └── widgets/         # Ask, Discord, PSN, now-playing, weather, vitals
│   │   ├── lib/
│   │   │   ├── queries/         # Storyblok fetchers (config, work, widgets, search-index)
│   │   │   ├── search/          # Ranking, autocomplete, ask prompt + NDJSON reader
│   │   │   ├── integrations/    # Third-party adapters (discord/Lanyard, …)
│   │   │   ├── page-theme.ts · seo.ts · schema-org.tsx · storyblok.ts · …
│   │   ├── proxy.ts             # Edge: preview-token, CSP, x-pathname
│   │   └── instrumentation.ts   # Sentry boot
│   ├── storybook/               # @httpjpg/ui docs + Argos visual regression
│   └── studio/                  # Dev-only grid editor → Storyblok (port 3001)
├── packages/                    # See package table below
├── tsconfig/ · tools/ · turbo.json · pnpm-workspace.yaml
```

### Packages

| Package                       | Role                                                                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `@httpjpg/portfolio`          | Deployed site: routes, widgets, queries, SEO, integrations                                                                          |
| `@httpjpg/storybook`          | Storybook host — not deployed                                                                                                       |
| `@httpjpg/studio`             | Dev grid editor; API routes 404 outside development                                                                                 |
| `@httpjpg/env`                | Env contract (`t3-oss` + zod); leaf — edge-safe loader                                                                              |
| `@httpjpg/tokens`             | Design tokens + `dist/tokens.css`; leaf                                                                                             |
| `@httpjpg/ui`                 | Panda component library (`styled-system/`, primitives, widgets). Tooltip positioning via `@floating-ui/react-dom` — don't hand-roll |
| `@httpjpg/storyblok-utils`    | Runtime types, `CMS_OPTIONS`, image presets, plain-text extraction, preview-token validation, `STORYBLOK_RELATIONS`                 |
| `@httpjpg/storyblok-api`      | Raw CDN client (`getStoryblokApi`) — no Next coupling                                                                               |
| `@httpjpg/storyblok-next`     | Cached `fetchStory()` (`unstable_cache`, 1 h, draft bypass) + `CACHE_TAGS`                                                          |
| `@httpjpg/storyblok-richtext` | Richtext → React via `@storyblok/react` + UI tag map                                                                                |
| `@httpjpg/storyblok-ui`       | `Sb*` blok components; re-exports utils types; `storyblokInit` / `apiPlugin`                                                        |
| `@httpjpg/storyblok-sync`     | CLI: push schemas/datasources from `CMS_OPTIONS` + tokens — not imported at runtime                                                 |
| `@httpjpg/spotify`            | Spotify API + `useNowPlaying` + vibrant color extraction                                                                            |
| `@httpjpg/now-playing`        | Draggable widget UI (`@httpjpg/ui` peer for `Marquee`) — UI only                                                                    |
| `@httpjpg/analytics`          | GA4 + Umami wrappers; load behind `analytics` consent via `ConsentGate`                                                             |
| `@httpjpg/ai`                 | Groq chat client (`createGroqClient`, streaming, `GroqApiError`); prompts live in the app                                           |
| `@httpjpg/observability`      | Sentry init for client / server / edge                                                                                              |
| `@httpjpg/consent`            | Consent state machine + banner UI + `EXTERNAL_VENDORS`                                                                              |
| `@httpjpg/terminal`           | Shared terminal output style for the repo's dev CLIs                                                                                |
| `@httpjpg/credentials`        | Dev CLIs to mint/verify Spotify + PSN credentials (`pnpm creds:spotify` / `creds:psn`)                                              |

Storyblok layering:

```
storyblok-utils ← storyblok-api    storyblok-richtext ← storyblok-ui
       ↑               ↑                  ↑                 ↑
    tokens            env                ui           ui, consent, richtext, utils
                       ↑
              storyblok-next ← apps/portfolio
```

### Imports & dependency direction

- Only portfolio aliases `@/*` → `apps/portfolio/*`. Elsewhere import `@httpjpg/<name>`, never relative into another package.
- Leaves: `tokens`, `env` (no workspace deps).
- `storyblok-utils` → `tokens` only · `storyblok-api` → `env` · `storyblok-next` → `storyblok-api` (Next apps only)
- `storyblok-ui` → `ui`, `consent`, `storyblok-richtext`, `storyblok-utils`
- `now-playing` → `spotify` + peer `@httpjpg/ui` (`ui` must not import back)
- Apps may import anything

## TypeScript

- Strict (`tsconfig/base.json`). Prefer `// @ts-expect-error <reason>` over `@ts-ignore`.
- Object shapes → `interface`, not `type X = { … }` (repo convention).
- No `enum` — use `as const` maps / union literals.
- Export types next to implementations (`export { Foo, type FooProps }`). Avoid separate `*.types.ts` unless the surface is large.
- Avoid `any`; narrow `unknown` or use `StoryblokBlokData`.

```ts
const STATUS = { online: "online", idle: "idle", dnd: "dnd", offline: "offline" } as const;
type Status = (typeof STATUS)[keyof typeof STATUS];
```

## Functions & components

Migrate touched files toward these; no drive-by sweeps.

- Pure helpers → `function` keyword (not `const` arrows).
- Plain components → named `function`; `forwardRef` / `memo` → named `const` + `displayName`.
- Hooks → `function useFoo()`.
- No default exports except Next.js `app/**` entry files (`page` / `layout` / `loading` / `error` / `not-found` / `route`) and Storybook `export default meta`.
- One exported component per file; file order: props interface → component → private subs → helpers → constants → types-only.

```ts
export function formatYear(date?: string): string | null {
  return date ? new Date(date).getFullYear().toString() : null;
}

export function WorkCardTitle({ title }: WorkCardTitleProps) {
  return <h3>{title}</h3>;
}

export const WorkCard = forwardRef<HTMLDivElement, WorkCardProps>(function WorkCard(props, ref) {
  /* … */
});
WorkCard.displayName = "WorkCard";
```

### Naming

| Kind                 | Style                                                    | Example                     |
| -------------------- | -------------------------------------------------------- | --------------------------- |
| Components / types   | PascalCase                                               | `WorkCard`, `SbButtonProps` |
| Hooks                | `use*`                                                   | `useNowPlaying`             |
| Vars / fns           | camelCase                                                | `formatYear`                |
| Module const data    | SCREAMING_SNAKE                                          | `STORYBLOK_RELATIONS`       |
| Module const handles | camelCase                                                | `tagRenderers`              |
| Booleans             | `is*` / `has*` / `can*` locally; noun props (`disabled`) |                             |
| Handlers             | `handle*` local / `on*` prop                             |                             |

Dirs and most source files: kebab-case. Subcomponents: `<parent>-<child>.tsx`. Helpers: `lib.ts` (or scoped). Tests: `<source>.test.ts(x)`. Stories: `<Component>.stories.tsx`.

Helpers > 20 LOC or shared → `lib.ts` beside them. Build-time helpers stay outside `src/` (e.g. `packages/ui/panda.helpers.ts`). One concern per helper file.

### `@httpjpg/ui` vs `@httpjpg/storyblok-ui`

**ui** — generic primitives, no CMS coupling:

```
packages/ui/src/components/work-card/
  work-card.tsx          # exports WorkCard
  work-card-date.tsx     # private sub
  work-card.test.tsx
```

Folder = kebab name; main file matches folder; sub-files use the parent prefix (`work-card-*`); re-export via `export * from "./work-card/work-card"`.

**storyblok-ui** — 1:1 CMS bloks. `Sb` prefix is mandatory: marks CMS, avoids colliding with UI primitives (`SbImage` wraps `Image`), mirrors registry keys (`{ work_card: SbWorkCard }`).

```
packages/storyblok-ui/src/components/work-card/SbWorkCard.tsx
```

- Props: `Sb<Pascal>Props` with `{ blok: BlokSpacing & { _uid: string; … } }`
- Explicit re-exports from `src/index.ts` (no wildcards)

New blok checklist:

1. Schema in `packages/storyblok-sync/scripts/blocks/<group>.ts`
2. `pnpm --filter @httpjpg/storyblok-sync sync:components` (+ `sync:datasources` if needed)
3. `packages/storyblok-ui/src/components/<kebab>/Sb<Pascal>.tsx`
4. Explicit export from `packages/storyblok-ui/src/index.ts`
5. Register in `apps/portfolio/lib/storyblok.ts`

## React & Next.js

- `"use client"` only for state / effects / browser APIs / refs / handlers; keep client boundaries small.
- Fetch Storyblok on the server (`fetchStory` cached, or `getStoryblokApi` uncached); never from the client.
- Per-request dedupe: `react.cache()` (e.g. `getCachedStory` so `generateMetadata` + page share one roundtrip).
- Missing story → `notFound()`; throw from route handlers only for real 500s. Log user-facing Storyblok failures to Sentry.

## Storyblok

- Registry in `apps/portfolio/lib/storyblok.ts` (imported from layout + `StoryblokProvider`). Dev `_fallback: SbMissing`.
- Every `Sb*` spreads `editableAttrs(blok)` on the root.
- Spacing: `withSpacing()` (sync, 24-field matrix) ↔ `BlokSpacing` + `spacingCss()` (runtime) — keep in lock-step.
- Draft: `getStoryblokApi({ draftMode: true })` uses preview token + `version: "draft"`; `proxy.ts` validates the preview-token hash.
- Revalidate webhook: `app/api/revalidate/route.ts` → `CACHE_TAGS.STORY/STORIES/CONFIG` + paths.
- New CMS option: edit `storyblok-utils/src/cms-options.ts` → `sync:datasources` → rebuild `ui`.

## Panda CSS

- One-offs: `css({})` from `styled-system/css`. Composition: `<Box css={…}>`.
- Tokens over hex (`bg: "primary.500"`, `color: "pageFg"`). Hex only for genuinely off-palette decoration.
- Semantic `pageBg` / `pageFg` / `pageBorder` for themed surfaces.
- Dynamic inline styles: `token.var("colors.success.500")`.
- Build helpers (`hexToRgba`, `linearGradient`) live in `panda.helpers.ts` — never re-export from the runtime index.

## Caching

- All cached Storyblok reads through `fetchStory()` in `@httpjpg/storyblok-next` so the tag set stays consistent.
- Tags: `CACHE_TAGS.STORY(slug)`, `STORIES`, `CONFIG` — never bare strings with `revalidateTag`.
- Default TTL 1 h + webhook invalidation; avoid ad-hoc TTLs.
- Per-request dedupe with `react.cache()` is cheap — cache loaders, not raw API calls.

## Search & Ask

Command palette (`⌘K` / `Ctrl+K`) has search + ask sharing one corpus.

- **One index:** `getSearchIndex()` → `SearchDocument[]` under `CACHE_TAGS.STORIES`. Don't add a second corpus.
- **Ranking is lexical and pure** (`rankDocuments`, `suggestCompletions`) — autocomplete is not an AI call.
- **`GET /api/search`** → `{ results, suggestions }`. **`POST /api/ask`** streams NDJSON (`sources` → `delta` → `action`|`error`). Both rate-limited.
- **`action` is derived**, not asked for: `firstCitedSource()` resolves the first `[n]` citation; `readAskStream` re-checks same-origin. External / uncited answers get no action.
- **AI is optional.** No `GROQ_API_KEY` → ask is 503 / hidden; search still works. Prompts in the app (`buildAskMessages`), never in `@httpjpg/ai`.
- **UI split:** presentational `CommandPalette` (`@httpjpg/ui`) vs stateful `AskWidget`. Open via keyboard or `SearchTrigger` → `OPEN_SEARCH_EVENT` (not keyboard-only — touch needs the trigger).

## Work tags

Controlled vocabulary, not free text.

- Catalog: `WORK_TAGS` in `storyblok-utils` (`value` stable, `label` displayed, `group`) → `sync:datasources`. Editors pick from the datasource; never type.
- `SearchDocument.tagValues` = canonical · `tags` = display labels. Search matches both. `resolveWorkTags()` drops unknown values.
- Readers must tolerate missing `tagValues` (cached index can lag a deploy by up to 1 h).
- Related work: rarity-weighted shared tags (`relatedDocuments`). Untagged → no neighbours; padding with unrelated work would duplicate prev/next. Empty state shows a one-line diagnostic only in draft / `pnpm dev`.
- Separate axes: `tag_list` (Projects / Websites nav in `lib/queries/work.ts`) vs `content.tags` (topic vocabulary). Don't mix.

## Locales

A few stories (currently CV) are bilingual. English stays at `/cv`; German is `/de/cv`. `LOCALIZED_SLUGS` in `lib/locale.ts` is the allowlist — don't prefix every route. Visual Editor uses `_storyblok_lang`; the public site uses the path prefix. `LanguagePicker` only renders on those slugs.

## Page-wide audio

Audio outlives client navigations (like the iOS app's `AudioPlayerModel`).

- One `AudioPlayerProvider` in root `app/layout.tsx` — never a second, never under a route segment.
- `useAudioPlayer()` → `null` outside the provider so Storybook/tests work without an engine.
- Bloks register tracks via `useAudioQueueEntry`; they don't own playback. With a provider, mp3 mode renders `AudioTrackRow`; without, falls back to `MP3Player`. Spotify / SoundCloud embeds stay out of the queue.
- `play()` snapshots the registry so next/prev survive unmount. Header: `MiniPlayerSlot` / controlled `MiniPlayer` (nothing until something is loaded).
- Record links home via client `Link` — a document reload would stop playback. `navigator.mediaSession` for lock-screen transport.

## Footer status widgets

Live footer lines (Discord, Discogs, Letterboxd, X, PSN, Cloudflare) render through `FooterStatusLine` in `@httpjpg/ui`. Don't invent a second status row. Classic 350×19 userbars sit below the wave via `Userbars`, sourced from the config story — not a status line.

## Work accent

Work pages may set a Project Accent Color (`#RGB` / `#RRGGBB`). `parseWorkAccent` / `applyWorkAccent` in `@httpjpg/ui` write `--work-accent`, `--work-on-accent`, and `--work-accent-fill*` on `<html>` via `ThemeSync`. Cursor, trail, lightbox chrome, and work-card titles read those vars — don't invent a second palette.

## Lightbox

Same presentational/stateful split as the command palette.

- Controlled `Lightbox` (`open` / `index` / `items` + `onClose` / `onIndexChange`) + `useLightbox()` for callers.
- Portal must restate theme via `usePageTheme()` — overlay renders into `document.body`, outside `[data-theme]`, so semantic tokens resolve correctly. Any future portalled overlay needs the same.
- Trigger is a sibling overlay (`cover` default / `corner` when the media has its own controls), not a wrapper (invalid markup otherwise).
- ASCII chrome (`[ 02 / 05 ]`, `[ ← ]` …); wrap + clamp index; preload neighbours; videos skip preload; credit always `CopyrightLabel` `below` variant.
- Opt-in only on `image` / `video` bloks — not slideshow. Rendition: `imagePreset.full` (2560px, usually a cache hit).

## Env & observability

- Always `import { env } from "@httpjpg/env"` — never raw `process.env` outside `env.mjs` (except `NODE_ENV`).
- New env: declare in `packages/env/src/env.mjs` + `runtimeEnv` + turbo `globalEnv` / task `env` if build-affecting.
- Sentry via `capture*Exception` from `@httpjpg/observability/sentry/{client,server,edge}` — not `@sentry/nextjs` directly.
- Non-CMS app settings: `apps/portfolio/lib/config.ts`. CMS settings: Storyblok config story via `lib/queries/config.ts`.

## Forms

None today. If adding: `react-hook-form` + zod (catalog v4), compose with `@httpjpg/ui` — no form UI library.

## Testing

- **Unit:** Vitest, colocated `*.test.ts(x)`, globals on, `pnpm test` (root `vitest.config.ts`).
- **Component:** `@testing-library/react` + `@testing-library/jest-dom/vitest`.
- **E2E:** Playwright in `apps/portfolio/tests/e2e` — `pnpm --filter @httpjpg/portfolio test:e2e`.
- **Visual:** `@storybook/addon-vitest` + `@argos-ci/storybook` capture every story. Argos stores baselines, diffs, and the review UI. Locally, `pnpm --filter @httpjpg/storybook test:visual` writes `./screenshots` without uploading.
- **CI:** lint → typecheck → test → build → e2e → visual.

### Visual regression

Argos owns the baseline: `main` is the reference, PRs upload and Argos compares. Review/approve in Argos (`argos` GitHub status) — not a label or committed snapshot.

- **Storybook SDK:** `@storybook/addon-vitest` + `argosVitestPlugin` (`uploadToArgos: !!process.env.CI`). Chromium uses `--disable-lcd-text --font-render-hinting=none` and `reducedMotion: "reduce"` so motion settles before capture. `AnimateInView` skips its JS tween under reduced motion — Argos pauses CSS, not `motion/react`. `Slideshow` also drops blur-up and eager-loads every slide under reduced motion so WorkList cards below the fold are not captured as skeletons. Overflowing stories (e.g. Slideshow / WorkList) set `parameters.argos.fitToContent: false` for a viewport shot. No Docker, don't commit screenshots; `test:visual` is not a cacheable turbo task (a hit would skip the upload).
- **Auth is OIDC** (`id-token: write`, no `ARGOS_TOKEN`; tokenless fallback on fork PRs). Make the `argos` status a required check. The Vitest job itself only fails when a story does not render.
- **Local fixtures, not the CDN** — portable stories hit a real browser; prefer `OPTIMIZED_IMAGES` / files under `apps/storybook` over picsum/Unsplash. Third-party embeds (Spotify, SoundCloud, YouTube, Vimeo) and remote `<video>` stay out via Storybook's `!test` tag; the Vitest plugin also hides leftover `iframe`/`video` paint via `argosCSS`.
- **Extra viewports:** Argos modes via `allModes` from `.storybook/modes.ts` + `parameters.argos.modes`. Skip with Storybook's `!test` tag — not a home-grown opt-out.
- **Chromatic still publishes** Storybook only (snapshots off). Don't hand Argos hosting or Chromatic testing.

## Tooling

```bash
pnpm dev                 # all watchers
pnpm dev:portfolio       # portfolio + deps
pnpm dev:storybook
pnpm dev:studio          # grid editor on :3001
pnpm build               # PANDA_PRODUCTION=1 turbo run build
pnpm type-check · test · lint · lint:fix · format · format:check
pnpm test:visual         # capture story screenshots (uploads to Argos when CI=1)
```

- Lint/format clean before commit (Husky + lint-staged). Conventional Commits (commitlint).
- No `console.log` in shipped paths; `console.error` / `console.warn` OK alongside Sentry.

### Releases

Automated by release-please. One repo version (root `package.json`); workspace packages stay `private` at `0.0.0`.

**Never hand-edit** the root version, `.release-please-manifest.json`, or the newest `CHANGELOG.md` section outside an open `chore(release):` PR.

Loop: conventional commit on `main` → release-please opens/updates one release PR → **human curates** the changelog (prose, not commit subjects) → merge tags `v*`, GitHub Release, Sentry release. Curate late — regen overwrites. `### Removed` is manual. Override with `Release-As: x.y.z` in a commit body.

| Type                             | Section      | Bump  |
| -------------------------------- | ------------ | ----- |
| `feat`                           | Added        | minor |
| `fix`                            | Fixed        | patch |
| `refactor` / `style` / `revert`  | Changed      | patch |
| `perf`                           | Performance  | patch |
| `build` / `ci` / `docs` / `test` | Tooling      | patch |
| `deps`                           | Dependencies | patch |
| `chore`                          | hidden       | patch |
| `BREAKING CHANGE:`               | BREAKING     | major |

Every conventional commit bumps at least patch (`hidden` only hides from the changelog). Renovate uses `deps:`.

Pitfalls:

- `ci.yml` `guard` skips jobs on `release-please--*` so required checks still report (don't use `[skip ci]` / `paths-ignore`).
- Root `"package-name": ""` in release-please config must stay empty or tagging breaks.
- Deploy version via `resolveAppVersion()` → tag (matches Sentry sourcemaps). Release PR via **httpjpg-bot** App token (not `GITHUB_TOKEN` alone — that won't start workflows).

### Adding dependencies

- `pnpm add` from the **package directory**, not the root.
- Catalog: `"dep": "catalog:"`. Workspace: `"@httpjpg/x": "workspace:*"`.
- Peer deps when the consumer must own a single copy (React, `@httpjpg/ui` as peer).

## When in doubt

1. Copy a neighboring file's shape.
2. Prefer fewer abstractions; three similar lines beat a half-baked helper.
3. One concern per PR — don't refactor and add features together.
4. Match convention over "better" pattern; note the better idea in the PR description.
5. Ask before guessing CMS fields, cache tags, or layout intent.
