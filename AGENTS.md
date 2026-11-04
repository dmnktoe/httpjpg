# Coding Agent Guidelines

> Guide for AI coding agents in the httpjpg monorepo. Mirror existing conventions; don't invent new patterns without a strong reason.

Brutalist portfolio site: Storyblok CMS → Next.js 16 App Router → Panda CSS (zero-runtime) → pnpm + Turbo monorepo.

When generating or updating code: read neighboring files first, prefer the existing pattern over an inventive one, keep changes scoped.

## Stack

- **TypeScript** — strict mode, `interface` for object shapes, no `enum`
- **Node.js** ≥ 22.12 (pinned via `.nvmrc` to 24.22.1), ESM-only (`"type": "module"` in every workspace package; the private root `package.json` does not declare it)
- **Next.js 16.4** App Router + **Cache Components** (`cacheComponents` + `partialPrefetching`) — Server Components by default, route handlers in `app/api/*`
- **React 19** — functional components only
- **Panda CSS** (zero-runtime) — `css({})` / `cx()` / token-aware patterns; tokens from `@httpjpg/tokens`
- **Storyblok** — Visual Editor live-bridge in dev, draft mode in production
- **Sentry** — via `@httpjpg/observability` for client / server / edge
- **Vitest** (jsdom by default; `// @vitest-environment node` for node) · **Playwright** for E2E (`apps/portfolio/tests/e2e`)
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
│   │   │   └── widgets/         # Ask, Discord, Cloudflare, PSN, now-playing, weather, vitals
│   │   ├── lib/
│   │   │   ├── queries/         # Storyblok fetchers (config, work, widgets, search-index)
│   │   │   ├── search/          # Ranking, autocomplete, ask prompt + NDJSON reader
│   │   │   ├── integrations/    # Third-party adapters (discord/Lanyard, …)
│   │   │   ├── page-theme.ts · seo.ts · schema-org.tsx · storyblok.ts · …
│   │   ├── proxy.ts             # Edge: preview-token, CSP, x-pathname
│   │   └── instrumentation.ts   # Sentry boot
│   ├── storybook/               # @httpjpg/ui docs, published via Chromatic
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
| `@httpjpg/storyblok-next`     | Cache Components layer: `readStory()` (`"use cache"`, draft bypass), `CMS_TAGS`, `CACHE_LIFE.cms`, `expireStory` / `expireConfig`   |
| `@httpjpg/storyblok-richtext` | Richtext → React via `@storyblok/react` + UI tag map                                                                                |
| `@httpjpg/storyblok-ui`       | `Sb*` blok components; re-exports utils types; `storyblokInit` / `apiPlugin`                                                        |
| `@httpjpg/storyblok-sync`     | CLI: push schemas/datasources from `CMS_OPTIONS` + tokens — not imported at runtime                                                 |
| `@httpjpg/spotify`            | Spotify API + `useNowPlaying` + vibrant color extraction                                                                            |
| `@httpjpg/now-playing`        | Draggable widget UI (`@httpjpg/ui` peer for `Marquee`) — UI only                                                                    |
| `@httpjpg/analytics`          | Typed `track*` catalog → self-hosted Umami; load behind `ConsentGate` (analytics is opt-out)                                        |
| `@httpjpg/ai`                 | Groq chat client (`createGroqClient`, streaming, `GroqApiError`); prompts live in the app                                           |
| `@httpjpg/observability`      | Sentry init for client / server / edge                                                                                              |
| `@httpjpg/consent`            | Consent state machine + banner UI + `EXTERNAL_VENDORS`                                                                              |
| `@httpjpg/terminal`           | Shared terminal output style for the repo's dev CLIs                                                                                |
| `@httpjpg/credentials`        | Dev CLIs to mint/verify Spotify + PSN credentials (`pnpm creds:spotify` / `creds:psn`)                                              |

Storyblok layering:

```
storyblok-utils ← storyblok-api    storyblok-richtext ← storyblok-ui
       ↑               ↑                  ↑                 ↑
    tokens            env                ui           ui, consent, analytics, richtext, utils
                       ↑
              storyblok-next ← apps/portfolio
```

### Imports & dependency direction

- Only portfolio aliases `@/*` → `apps/portfolio/*`. Elsewhere import `@httpjpg/<name>`, never relative into another package.
- Leaves: `tokens`, `env` (no workspace deps).
- `storyblok-utils` → `tokens` only · `storyblok-api` → `env` · `storyblok-next` → `storyblok-api` (Next apps only)
- `storyblok-ui` → `ui`, `consent`, `analytics`, `storyblok-richtext`, `storyblok-utils` (bloks may call `track*`; `ui` stays analytics-free)
- `consent` → `ui` · `analytics` / `observability` → `env` · `terminal` → `tokens` · CLIs (`credentials`, `storyblok-sync`) → `terminal`
- `now-playing` → `spotify`, `tokens` + peer `@httpjpg/ui` (`ui` must not import back)
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
- Fetch Storyblok on the server (`readStory` cached, or `getStoryblokApi` inside your own `"use cache"` scope); never from the client.
- Per-request dedupe: `react.cache()` (e.g. `readPageStory` so `generateMetadata` + page + root layout share one roundtrip).
- Missing story → `notFound()`; throw from route handlers only for real 500s. Log user-facing Storyblok failures to Sentry.

## Storyblok

- Registry in `apps/portfolio/lib/storyblok.ts` (imported from layout + `StoryblokProvider`). Dev `_fallback: SbMissing`.
- Every `Sb*` spreads `editableAttrs(blok)` on the root.
- Spacing: `withSpacing()` (sync, 24-field matrix) ↔ `BlokSpacing` + `spacingCss()` (runtime) — keep in lock-step.
- Draft: `getStoryblokApi({ draftMode: true })` uses preview token + `version: "draft"`; `proxy.ts` validates the preview-token hash.
- Revalidate webhook: `app/api/revalidate/route.ts` → `expireStory(slug)` / `expireConfig()` + paths.
- New CMS option: edit `storyblok-utils/src/cms-options.ts` → `sync:datasources` → rebuild `ui`.

## Panda CSS

- One-offs: `css({})` from `styled-system/css`. Composition: `<Box css={…}>`.
- Tokens over hex (`bg: "primary.500"`, `color: "pageFg"`). Hex only for genuinely off-palette decoration.
- Semantic `pageBg` / `pageFg` / `pageBorder` for themed surfaces.
- Dynamic inline styles: `token.var("colors.success.500")`.
- Everything Panda emits is namespaced `jpg` (`prefix` in `packages/ui/panda.config.ts`): classes `jpg-d_flex`, vars `--jpg-colors-black`, hashed in production. Assert classes with the prefix in tests; never hand-write `var(--jpg-*)` — use `{colors.*}` / `token.var()`.
- Build helpers (`hexToRgba`, `linearGradient`) live in `panda.helpers.ts` — never re-export from the runtime index.

## Caching

Cache Components: nothing is cached unless a `"use cache"` scope says so. Three pieces, all in `@httpjpg/storyblok-next`:

| Piece        | API                                                   | Rule                                                                             |
| ------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Lifetime** | `cacheLife("cms")` ← `CACHE_LIFE` in `next.config.ts` | Storyblok reads use `cms` (1 h ceiling, webhook expires sooner). No ad-hoc TTLs. |
| **Tags**     | `cacheTag(CMS_TAGS.story(slug) / .stories / .config)` | Never a bare tag string.                                                         |
| **Expiry**   | `expireStory(slug)` / `expireConfig()`                | Only the webhook calls them; they return the tags they expired.                  |

- Read a story with `readStory(slug, { draft, relations, language })`. Lists and indexes are app-side `read*` helpers with their own scope (`readRecentWork`, `getSearchIndex`, `readWorkStories`, …) — `"use cache"` + `cacheLife` + `cacheTag` at the top, nothing request-bound inside.
- Draft is never cached: branch on `draft` **outside** the scope and `await connection()` before the uncached read, so it waits for request time instead of being aborted in the prerender pass.
- Keep failures out of the `cms` hour. The Storyblok client answers null / empty instead of throwing, so check the result inside the scope:
  - Reads rendered by pages (`readStory`, config): on a miss call `cacheLife("seconds")` instead of `"cms"`. Never throw there — an error from a cache scope fails the page prerender.
  - Route handlers (sitemap, feed): throw inside the scope, catch outside, `unstable_rethrow(error)` first, then `await connection()` before the fallback so a build-time outage is not frozen into the prerender.
- Third-party widget feeds use inline lifetimes from `WIDGET_MAX_AGE` (`cacheLife({ revalidate: WIDGET_MAX_AGE.x })`). `widgetRoute()` calls `connection()` so rate limiting and draft checks stay per request.
- The root layout (and the page routes under it) export `instant = false`: `<html data-theme lang>` comes from the request path. Every read under it is cached, so the per-request render stays cheap.
- No `dynamic` / `revalidate` / `runtime` segment configs — Cache Components rejects them.
- Entries are in-memory and keyed by build: a deploy starts cold, and self-hosting keeps them across requests.

## Search & Ask

Command palette (`⌘K` / `Ctrl+K`) has search + ask sharing one corpus.

- **One index:** `getSearchIndex()` → `SearchDocument[]` under `CMS_TAGS.stories`. Don't add a second corpus.
- **Ranking is lexical and pure** (`rankDocuments`, `suggestCompletions`) — autocomplete is not an AI call.
- **`GET /api/search`** → `{ results, suggestions }`. **`POST /api/ask`** streams NDJSON (`sources` → `delta` → `action`|`error`). Both rate-limited.
- **`action` is derived**, not asked for: `firstCitedSource()` resolves the first `[n]` citation; `readAskStream` re-checks same-origin. External / uncited answers get no action.
- **AI is optional.** No `GROQ_API_KEY` → ask is 503 / hidden; search still works. Prompts in the app (`buildAskMessages`), never in `@httpjpg/ai`.
- **UI split:** presentational `CommandPalette` (`@httpjpg/ui`) vs stateful `AskWidget`. Open via keyboard or `SearchTrigger` → `OPEN_SEARCH_EVENT` (not keyboard-only — touch needs the trigger).
- Search/ask events go through `trackSearch*` / `trackAsk*` in `@httpjpg/analytics`.

## Analytics & consent

- `@httpjpg/analytics` is Umami-only (no GA). Typed `track*` helpers live here; prompts stay in the app.
- Analytics is **opt-out**: `OPT_OUT_CATEGORIES` in `@httpjpg/consent` keeps Umami on until the visitor rejects it. `ConsentGate` still wraps `UmamiAnalytics` (`data-do-not-track` + `data-performance`).
- Vendors and first-party cookies are listed on `/cookie-policy` (`EXTERNAL_VENDORS`, `SITE_COOKIES`, cookiedatabase.org).
- Portfolio wraps header / audio / lightbox as `TrackedHeader` / `TrackedAudioPlayerProvider` / `TrackedLightboxProvider` so `@httpjpg/ui` stays analytics-free.

## Work tags

Controlled vocabulary, not free text.

- Catalog: `WORK_TAGS` in `storyblok-utils` (`value` stable, `label` displayed, `group`) → `sync:datasources`. Editors pick from the datasource; never type.
- `SearchDocument.tagValues` = canonical · `tags` = display labels. Search matches both. `resolveWorkTags()` drops unknown values.
- Readers still tolerate missing `tagValues` (the type stays optional; `"use cache"` entries no longer outlive a deploy).
- Related work: rarity-weighted shared tags (`relatedDocuments`). Untagged → no neighbours; padding with unrelated work would duplicate prev/next. Empty state shows a one-line diagnostic only in draft / `pnpm dev`.
- Separate axes: `tag_list` (Projects / Websites nav in `lib/queries/work.ts`) vs `content.tags` (topic vocabulary). Don't mix.

## Locales

A few stories (currently CV) are bilingual. English stays at `/cv`; German is `/de/cv`. `LOCALIZED_SLUGS` in `lib/locale.ts` is the allowlist — don't prefix every route. Visual Editor uses `_storyblok_lang`; the public site uses the path prefix. `LanguagePicker` only renders on those slugs.

## Page-wide audio

Audio outlives client navigations (like the iOS app's `AudioPlayerModel`; native reader: `dmnktoe/httpjpg-ios`).

- One `AudioPlayerProvider` in root `app/layout.tsx`, wrapped as `TrackedAudioPlayerProvider` — never a second, never under a route segment.
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

- Controlled `Lightbox` (`open` / `index` / `items` + `onClose` / `onIndexChange`) + `useLightbox()` for callers. Portfolio wraps the provider as `TrackedLightboxProvider`.
- Portal must restate theme via `usePageTheme()` — overlay renders into `document.body`, outside `[data-theme]`, so semantic tokens resolve correctly. Any future portalled overlay needs the same.
- Trigger is a sibling overlay (`cover` default / `corner` when the media has its own controls), not a wrapper (invalid markup otherwise).
- ASCII chrome (`[ 02 / 05 ]`, `[ ← ]` …); wrap + clamp index; preload neighbours; videos skip preload; credit always `CopyrightLabel` `below` variant.
- Opt-in only on `image` / `video` bloks — not slideshow. Rendition: `imagePreset.full` (2560px, usually a cache hit).

## Holo card

Trading-card foil (Pokémon-TCG-Pocket style) for a single image, as the `holo_image` blok → `SbHoloImage` → `HoloCard` (`@httpjpg/ui`). Don't rebuild it with CSS blend layers; they can't do per-pixel iridescence.

- **Two parts:** `useHoloTilt` writes `--holo-*` vars on the rotator (pointer, gyroscope, or idle drift, one rAF loop that sleeps off-screen or once settled); `holo-shader.ts` paints the foil in a WebGL fragment shader fed by the same state via `onFrame`. The rotator is plain CSS 3D (`perspective` + `rotateX/Y`) plus `drop-shadow`.
- **Variants:** `card` (holo frame, rounded corners, hex glitter, rainbow edge fringe, sparkles, glare) and `disc` (CD: hole, hub ring, grooves, diffraction fans). Both live in one shader behind `uVariant`. The frame `foil` is `silver` (pastel, Galagladi) or `swirl` (dark oil slick, Mew); `sparkle` is `stars`, `fireworks` (dense gold-white glints) or `none`. The CMS option lists in the sync schema mirror these unions — keep in lock-step.
- **Fallbacks, in order:** no WebGL / texture fails (CORS) → plain `<img>` still tilts; `prefers-reduced-motion` → rest pose, foil painted once, no loop. The `<img>` always stays in the DOM for alt text and LCP; the canvas is `aria-hidden` and fades in once the texture is decoded.
- **Gyroscope:** iOS gates `DeviceOrientationEvent.requestPermission` behind a tap, so `HoloCard` shows a `[ tap to tilt ]` mono button only there; the first reading after the card scrolls into view becomes the rest pose.
- Credit always renders `CopyrightLabel` `below`, outside the tilt.
- **Textures are same-origin.** `a.storyblok.com` sends no CORS headers, and a tainted image cannot be uploaded to WebGL. `SbHoloImage` therefore passes `textureSrc` / `foregroundSrc` through `sameOriginImageUrl()` (`/_next/image`, hosts allowed in `next.config.ts`), while the `<img>` keeps the CDN `src` / `srcSet`. Storybook proxies the CDN under `/storyblok-cdn` in dev (`holoTextureUrl`); the static build has no proxy and shows the plain image.
- **Depth:** the shader slides layers apart with the tilt (`depth`, default 1): photo behind the frame against the tilt, glitter on the surface, stars in front. An optional `foreground` cut-out (alpha, same crop as the photo via `getResponsiveImage`) floats furthest, with a shadow on the photo and a rainbow outline. That cut-out is what makes a card look like Pocket's layered art; without one the depth is subtler.
- **Layers:** besides the photo (`textureSrc`) a card takes `foregroundSrc` (cut-out), `effectsSrc` (shards with alpha on the overhang frame = card + `OVERSCAN` per side, never cropped, furthest in front) and `depthSrc` (greyscale, white = far, same crop; per-pixel parallax). `setLayer(kind, image)` on the renderer, texture units 1–3. The cut-out is either `foregroundFrame: "card"` (same crop as the photo, clipped by the holo frame) or `"overhang"` (same frame as the effects layer, drawn over the frame band and past the card edge, the Pocket full-art look); the blok's Foreground Framing option mirrors it, `SbHoloImage` crops only the `card` kind. The Blender pipeline in `tools/blender/` renders all four from one scene.
- **Particles:** the canvas overhangs the card by `OVERSCAN` on every side (`uCard` tells the shader where the card sits) so the four-point flares and the thin orbit arcs can spill past the edge, like Pocket's burst effects. They scale with `uActive`, so a resting card stays calm.
- **Physics:** follow at `SMOOTHING`, hold `RETURN_DELAY_MS` after the pointer leaves, then ease back at the slower `RETURN_SMOOTHING`. Foil strength scales with `dist` (light's distance from the centre), so a centred pointer shows little and tilting to an edge brings it out. Tuning studied from simeydotme/pokemon-cards-css (GPL-3.0), nothing copied.

### Holo card assets from Blender

`pnpm holo:render --name x --model x.glb --palette all --publish` → `tools/blender/render_card.py` (bpy, headless, Blender 4.2 – 5.x) renders photo, cut-out, effects and depth from one camera, `render-card.mjs` crops to the card with `sharp`, writes WebPs + manifest and can copy them to `public/images/holo/<variant>/`. `--fx shards` (Mew) or `--fx burst` (Scherox wedges, crystals, beams, radial rays), both directed along `--fx-angle` within `--fx-spread`; palettes incl. `scherox`. The wrapper adds a bloom pass (`--no-glow` to skip). Subject: `--model` (glTF/FBX/OBJ), `--image` (cut-out photo on a plane, alpha also shapes the depth map) or the gem placeholder; `--subject-overflow` renders it uncropped on the overhang frame and bigger than the card (pair with `foregroundFrame: "overhang"`). Backdrop: palette gradient, or `--bg-image` (the wrapper blurs and dims it with `sharp`; `--bg-blur` / `--bg-brightness` / `--bg-tint` for one-colour ex cards). `tools/blender/cutout.py` cuts a subject out of a photo (rembg) and writes a depth map (Depth Anything V2, ONNX) for `--image` / `--image-depth`, which gives the cut-out per-pixel relief in the depth pass. Demo cards use a blurred copy of the cut-out's own photo, not the procedural streaks. Own scenes work with collections `bg` / `subject` / `fx`. Layers are isolated with `hide_render`, depth by swapping materials per pass, no compositor (its API moved in 5.0). Overscan must match `OVERSCAN`. See `tools/blender/README.md`.

## Device frames

A video can play on the screen of a product photo: `video` blok → `frame: psp` → `SbVideo` wraps the player in `DeviceFrame` (`@httpjpg/ui`). Frame only, no tilt; `HoloCard` owns 3D.

- **How:** the cut-out device WebP is the frame, the screen quad is a `clip-path`, and the media is laid out flat at the screen's aspect and projected into the quad with a four-point homography (`matrix3dForQuad` in `device-frame/lib.ts`). A screened copy of the photo on top keeps the glass reflections.
- **Presets:** `DEVICE_FRAMES` in `device-frame/devices.ts` (image path under `apps/portfolio/public/images/devices/`, natural size, screen corners clockwise from top-left in file px, screen aspect). `DEVICE_FRAME_OPTIONS` in the sync schema mirrors the names — keep in lock-step. New device: cut-out WebP with alpha, read the four screen corners off the dark panel, add both entries.
- The screen aspect overrides the blok's aspect ratio; credit renders `CopyrightLabel` `below` the device, never on the screen. Embeds (YouTube / Vimeo) ignore the frame.

## Page actions & draft tools

One glass pill row at the bottom. Same presentational/stateful split as the lightbox.

- Presentational `FloatingActionBar` (`actions` → link / toggle / `status` pills; no page or draft knowledge). Stateful `PageActionsProvider` in root `app/layout.tsx` builds its actions — never a second.
- Not a `Badge`: that name is the 88×31 image buttons (`Badge` / `Badges`).
- Pages publish `href` / `accentColor` / `editHref` via `PageActions` (`SbPage`, `SbPageWork`). Only the live-URL pill is accented.
- Draft tools (status · edit · exit · grid, `G` toggles the 12-column overlay) show when `draftMode().isEnabled` or the page is draft content (`storyblokEditHref(_editable)`). Inside the Visual Editor (`isStoryblokEditor()`) edit + exit are dropped. Decide on the server — the bypass cookie is HttpOnly.

## Work downloads

Work pages scatter XP desktop icons via `DesktopDownloads` (`@httpjpg/ui`). CMS `download_item` bloks on `SbPageWork` feed the strip. Don't invent a second download path.

## Env & observability

- Always `import { env } from "@httpjpg/env"` — never raw `process.env` outside `env.mjs` (except `NODE_ENV`).
- New env: declare in `packages/env/src/env.mjs` + `runtimeEnv` + turbo `globalEnv` / task `env` if build-affecting.
- Sentry via `capture*Exception` from `@httpjpg/observability/sentry/{client,server,edge}` — not `@sentry/nextjs` directly.
- Site identity (name, locale, repo URL) lives on the Storyblok config story via `lib/queries/config.ts` — there is no `lib/config.ts`. Secrets and flags live in `@httpjpg/env`. Build knobs (version, CSP) live in `next.config.ts` / `proxy.ts`.

## Forms

None today. If adding: `react-hook-form` + zod (catalog v4), compose with `@httpjpg/ui` — no form UI library.

## Testing

- **Unit:** Vitest, colocated `*.test.ts(x)`, globals on, `pnpm test` (root `vitest.config.ts`). Coverage via `pnpm test:coverage` (v8, 85% floor). The include set covers packages plus `apps/portfolio` and `apps/studio`.
- **Component:** `@testing-library/react` + `@testing-library/jest-dom/vitest`.
- **E2E:** Playwright in `apps/portfolio/tests/e2e` — `pnpm --filter @httpjpg/portfolio test:e2e`.
- **Storybook:** published to Chromatic (snapshots off) — no visual regression testing.
- **CI:** lint → typecheck → test → build → e2e.

## Tooling

```bash
pnpm dev                 # all watchers
pnpm dev:portfolio       # portfolio + deps
pnpm dev:storybook
pnpm dev:studio          # grid editor on :3001
pnpm dev:https           # portfolio + Storybook over HTTPS
pnpm build               # PANDA_PRODUCTION=1 turbo run build
pnpm type-check · test · lint · lint:fix · format · format:check
pnpm test:coverage       # v8, 85% floor; include set is packages + portfolio + studio
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
