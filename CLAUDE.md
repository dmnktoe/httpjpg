# Coding Agent Guidelines

> Guide for AI coding agents working in the httpjpg monorepo. Mirror existing conventions; don't invent new patterns without a strong reason.

## Purpose

This is a brutalist portfolio site driven by Storyblok CMS, rendered by Next.js, styled with Panda CSS (zero-runtime), built on a pnpm + Turbo monorepo.

When generating or updating code: read neighboring files first, prefer the existing pattern over an inventive one, keep changes scoped.

---

## Technology Stack

- **TypeScript** — strict mode, `interface` for object shapes, no `enum`
- **Node.js** ≥ 22.12 (pinned via `.nvmrc` to 24.19.0), ESM-only (`"type": "module"` in every workspace package; the private root `package.json` does not declare it)
- **Next.js 16** App Router — Server Components by default, route handlers in `app/api/*`
- **React 19** — functional components only
- **Panda CSS** (zero-runtime) — `css({})` / `cx()` / token-aware patterns; consumes design tokens from `@httpjpg/tokens`
- **Storyblok** as CMS — Visual Editor live-bridge in dev, draft mode in production
- **Sentry** — error reporting via `@httpjpg/observability` for client/server/edge
- **Vitest** for unit tests (jsdom by default, node env via `// @vitest-environment node` pragma), **Playwright** for E2E in `apps/portfolio/tests/e2e` and for visual regression in `apps/storybook/tests/visual`
- **oxlint** + **oxfmt** — linting and formatting (no ESLint, no Prettier)
- **pnpm** workspaces with a catalog for shared versions, **Turbo** for task orchestration
- **t3-oss/env-nextjs** + **Zod** for env validation in `@httpjpg/env`

---

## Architecture Overview

### Monorepo Structure

```
/
├── apps/
│   ├── portfolio/               # Next.js 16 App Router site (the actual product)
│   │   ├── app/                 # Routes, layouts, route handlers
│   │   │   ├── (portfolio)/     # Public portfolio route group
│   │   │   ├── api/             # Route handlers (discord, spotify, draft, revalidate, …)
│   │   │   └── work/feed.xml/   # RSS feed
│   │   ├── components/          # App-specific React components
│   │   │   ├── providers/       # Consent, Storyblok live, registry init
│   │   │   ├── ui/              # Layout shell (footer wrapper, theme sync, work-nav)
│   │   │   └── widgets/         # Ask palette, Discord, PSN, now-playing, weather/time, web vitals
│   │   ├── lib/
│   │   │   ├── queries/         # Storyblok data fetchers (config, work, widgets, search-index, …)
│   │   │   ├── search/          # Ranking, autocomplete, ask prompt + NDJSON stream reader
│   │   │   ├── integrations/    # Third-party API adapters (discord/Lanyard, …)
│   │   │   ├── page-theme.ts    # Light/dark resolution from headers + draft mode
│   │   │   ├── seo.ts           # Story → Next Metadata mapping
│   │   │   ├── schema-org.tsx   # JSON-LD generation
│   │   │   ├── storyblok.ts     # Component registry init (server + client side-effect)
│   │   │   └── storyblok-slugs.ts
│   │   ├── proxy.ts             # Edge middleware: preview-token validation, CSP, x-pathname
│   │   └── instrumentation.ts   # Sentry boot for server + edge
│   ├── storybook/               # Storybook for @httpjpg/ui component dev/docs
│   └── studio/                  # Dev-only drag-and-drop grid editor for Storyblok bloks
│
├── packages/
│   ├── analytics/               # Google Analytics gtag wrapper
│   ├── consent/                 # Cookie consent state + banner UI + vendor catalog
│   ├── credentials/             # Dev CLIs to mint/verify Spotify + PSN widget credentials
│   ├── env/                     # Env validation (t3-oss + zod), edge-safe loader
│   ├── groq/                    # Groq chat-completions client (streaming + one-shot)
│   ├── now-playing/             # Draggable "now playing" widget UI
│   ├── observability/           # Sentry init for client / server / edge
│   ├── spotify/                 # Spotify API client + useNowPlaying hook + color extraction
│   ├── storyblok-api/           # Raw Storyblok CDN client (framework-agnostic)
│   ├── storyblok-next/          # Next.js caching layer on top of storyblok-api
│   ├── storyblok-richtext/      # Renders Storyblok richtext docs through a tag-handler map
│   ├── storyblok-sync/          # CLI tool: push schemas + datasources via Management API
│   ├── storyblok-ui/            # Sb* blok components consuming @httpjpg/ui
│   ├── storyblok-utils/         # Storyblok runtime types, image presets/processing, cms-options
│   ├── terminal/                # Shared terminal output style for the repo's dev CLIs
│   ├── tokens/                  # Design tokens (colors, typography, spacing, …) + CSS-var generator
│   └── ui/                      # Core UI component library (Panda CSS)
│
├── tsconfig/                    # Shared TS configs: base, nextjs, react-library
├── tools/                       # Repo tooling: oxlint plugin, Vitest setup, commitlint config
├── turbo.json                   # Task graph, cached inputs/outputs, env passthrough
└── pnpm-workspace.yaml          # Catalog versions for react, typescript, dotenv, …
```

### Package Responsibilities

#### Apps

- **`@httpjpg/portfolio`** — the deployed Next.js site. Owns all routes, app-specific widgets, data-fetching queries, SEO, schema-org, and integrations.
- **`@httpjpg/storybook`** — Storybook host for documenting and developing `@httpjpg/ui` and `@httpjpg/now-playing` components in isolation. Not deployed.
- **`@httpjpg/studio`** — dev-only "Grid Studio" (port 3001): visually composes `grid`/`grid_item` bloks with real `@httpjpg/ui` components and pushes the JSON to Storyblok via the Management API. All API routes 404 outside development; not deployed.

#### Foundations (no workspace deps)

- **`@httpjpg/env`** — runtime env contract via `@t3-oss/env-nextjs` + `zod`. Edge-safe: `load-env.js` only fires under Node, skipped on edge.
- **`@httpjpg/tokens`** — single source of truth for design tokens (colors, typography, spacing, shadows, opacity, sizes, transitions, borderRadius, z-index). Pure data; granular subpath exports per token family. Build script generates `dist/tokens.css` with CSS variables.

#### Core UI

- **`@httpjpg/ui`** — component library built on Panda CSS. Exports primitives (`Box`, `Stack`, `Grid`, `Container`), typography (`Headline`, `Paragraph`), media (`Image`, `Video`, `Slideshow`, `Lightbox`, `ScrollClipImage`), navigation (`Header`, `Footer`, `Link`, `NavLink`), interactive widgets (`MusicPlayer`, `MiniPlayer`, `CustomCursor`, `MouseTrail`, `WorkCard`, `WorkList`, `CommandPalette`, `SearchTrigger`), and structural pieces (`Page`, `Section`, `Divider`, `ShimmeringText`, `CopyrightLabel`). Owns `panda.config.ts` and the generated `styled-system/`. The runtime `src/lib/` holds format, external-link, favicon-url, and scroll-lock helpers; build-time helpers live in `panda.helpers.ts` next to the panda config. Anything anchored to an element — `Tooltip` today — positions through `@floating-ui/react-dom`, the engine Radix and Base UI also sit on; don't hand-roll the maths.

#### Storyblok stack (layered)

```
storyblok-utils  ←  storyblok-api    storyblok-richtext  ←  storyblok-ui
       ↑                ↑                    ↑                  ↑
       tokens          env                  ui                ui, consent,
                                                              storyblok-richtext,
                                                              storyblok-utils
                ↑
       storyblok-next  ←  apps/portfolio
```

- **`@httpjpg/storyblok-utils`** — framework-agnostic leaf. Owns Storyblok runtime types (`StoryblokStory`, `StoryblokImage`, `StoryblokLink`, `StoryblokRichText`, `StoryblokVideoAsset`, `StoryMetadata`, `StoryblokBlokData`, `StoryblokApiResponse`), `CMS_OPTIONS` (the design-token contract Storyblok emits), image processing/presets, plain-text extraction from richtext, preview-token validation, and `STORYBLOK_RELATIONS`.
- **`@httpjpg/storyblok-api`** — raw CDN client (`getStoryblokApi()`). No Next.js coupling, works in edge workers and scripts. Returns `{ client, getStory, getStories }`.
- **`@httpjpg/storyblok-next`** — Next.js cache layer on top. Owns `fetchStory()` (uses `unstable_cache` with `STORY(slug)` + `STORIES` tags, 1 h revalidate, draft mode bypass) and `CACHE_TAGS`. Apps import from here when they need cached fetches.
- **`@httpjpg/storyblok-richtext`** — renders a Storyblok richtext document to React via the `@storyblok/react` v7 renderer (`createRichTextRenderer`) with a `components` map keyed by node/mark type that maps onto `@httpjpg/ui` primitives.
- **`@httpjpg/storyblok-ui`** — `Sb*` blok components (e.g. `SbPage`, `SbWorkList`, `SbImage`, `SbMusicPlayer`) that consume `@httpjpg/ui` primitives and the `BlokSpacing` schema. Re-exports the runtime types from `storyblok-utils` for app convenience and exposes `storyblokInit` / `apiPlugin`.
- **`@httpjpg/storyblok-sync`** — `tsx`-driven CLI under `scripts/`. Pushes component schemas and datasources to Storyblok via the Management API. Reads `CMS_OPTIONS` from `storyblok-utils` and tokens from `@httpjpg/tokens` to keep the CMS contract in lock-step with the design system. Not imported at runtime.

#### Integrations & widgets

- **`@httpjpg/spotify`** — Spotify Web API client (server-side, uses `Buffer`), `useNowPlaying` polling hook, and `extractVibrantColor` (colorthief wrapper) for album-artwork color extraction.
- **`@httpjpg/now-playing`** — the actual draggable widget UI. Consumes `@httpjpg/spotify` for color extraction and `@httpjpg/ui` (peer) for `Marquee`. UI-only — no API or hook logic lives here.
- **`@httpjpg/analytics`** — analytics wrappers (Google Analytics 4 under `src/google/`, privacy-first Umami under `src/umami/`). Thin, env-driven wrappers; both tracker scripts load only behind `analytics` consent (gated in the app via `ConsentGate`). Track-functions follow `track*` naming and fan out to whichever providers are configured.
- **`@httpjpg/groq`** — Groq chat-completions client. Dependency-free leaf built on `fetch`, so it runs on node and edge alike: `createGroqClient()` returns `complete()` and a streaming `stream()` that yields content deltas via `parseSseStream`. Failures surface as `GroqApiError` (with an `isTransient` flag for 429/5xx) or `GroqNotConfiguredError` when no key is set. Owns no prompts — grounding lives in the app.
- **`@httpjpg/observability`** — Sentry init for the three Next runtimes. `getSentryConfig(scope)` resolves DSN, env, production flag, and enabled state per runtime.
- **`@httpjpg/consent`** — cookie consent state machine (`getConsent`, `setConsent`, `hasVendorConsent`, …), the `CookieBanner` (portal-rendered) + `CookieCategory` + `VendorList` UI, and the vendor catalog (`EXTERNAL_VENDORS`).
- **`@httpjpg/terminal`** — shared terminal output (colour, ASCII, structured lines) for the repo's dev CLIs. Depends on `tokens` for palette values; nothing UI.
- **`@httpjpg/credentials`** — `tsx` CLIs (`pnpm creds:spotify`, `pnpm creds:psn`) that mint and verify the Spotify and PSN credentials the widgets run on. Depends on `terminal`; not imported at runtime.

### Path Aliases

Only `apps/portfolio` defines an alias:

| Alias | Path               |
| ----- | ------------------ |
| `@/*` | `apps/portfolio/*` |

Across packages, always import workspace siblings via their package name (`@httpjpg/<name>`), never via relative paths into `../../<package>/src`.

### Dependency Direction Rules

- Tokens and env are leaves — they must not depend on anything in the workspace.
- `terminal` may depend on `tokens` but on nothing UI.
- `credentials` may depend on `terminal`.
- `storyblok-utils` may depend on `tokens` but on nothing UI.
- `storyblok-api` may depend on `env`.
- `storyblok-next` depends on `storyblok-api`; only Next.js apps import from `storyblok-next`.
- `storyblok-ui` may depend on `ui`, `consent`, `storyblok-richtext`, `storyblok-utils`.
- `now-playing` depends on `spotify` and declares `@httpjpg/ui` as a peerDependency (it uses `Marquee` from `ui`; `ui` must not import back).
- Apps may import anything.

---

## TypeScript Conventions

- **Strict mode** is enforced (`tsconfig/base.json`). Don't introduce `// @ts-ignore`; use `// @ts-expect-error <reason>` when truly necessary.
- **Interfaces for object shapes** — there are ~110 `interface` declarations in the repo and effectively no `type X = { ... }` aliases. Match that.
- **No `enum`** — use a `const` map or a union literal:

  ```ts
  // ✅
  const STATUS = { online: "online", idle: "idle", dnd: "dnd", offline: "offline" } as const;
  type Status = (typeof STATUS)[keyof typeof STATUS];

  // ❌
  enum Status {
    Online,
    Idle,
    Dnd,
    Offline,
  }
  ```

- **Export types next to implementations** (`export { Foo, type FooProps }`). Don't ship a separate `*.types.ts` file unless the surface is large.
- Avoid `any`. Where the Storyblok payload is genuinely unknown, type it as `unknown` and narrow, or use the centralised `StoryblokBlokData` type.

---

## Function & Component Semantics

This is the convention to apply going forward. Existing code is mixed; **migrate touched files toward it**, don't do drive-by sweeps.

### Pure functions and helpers

Always declared with the `function` keyword. Named, hoistable, easy to spot.

```ts
// ✅
export function formatYear(date?: string): string | null {
  return date ? new Date(date).getFullYear().toString() : null;
}

// ❌
export const formatYear = (date?: string) =>
  date ? new Date(date).getFullYear().toString() : null;
```

### React components

- **Plain component** → named function declaration.

  ```tsx
  export function WorkCardTitle({ title }: WorkCardTitleProps) {
    return <h3>{title}</h3>;
  }
  ```

- **Component that needs `forwardRef` or `memo`** → named `const` with the wrapper, plus `displayName`.

  ```tsx
  export const WorkCard = forwardRef<HTMLDivElement, WorkCardProps>(function WorkCard(props, ref) {
    /* … */
  });
  WorkCard.displayName = "WorkCard";
  ```

- **Hooks** → `function useFoo()` (React's rules apply).
- **No default exports** outside two places that require them. Next.js App Router needs a default in `apps/portfolio/app/**` for `page.tsx` / `layout.tsx` / `loading.tsx` / `error.tsx` / `not-found.tsx` / `route.ts`. Storybook's CSF format needs `export default meta` in `apps/storybook/**/*.stories.tsx`. Nowhere else.
- **One exported component per file.** Subcomponents either go in sibling files (preferred when ≥ 30 lines or reused) or stay private and unexported.
- **File layout inside a component file:** exports first (props interface → component), then private subcomponents, then helpers, then static constants, then types-only.

### Naming

#### Identifiers

| Kind                       | Style                            | Example                                |
| -------------------------- | -------------------------------- | -------------------------------------- |
| Components & types         | PascalCase                       | `WorkCard`, `NavItem`, `BlokSpacing`   |
| Hooks                      | camelCase, `use` prefix          | `useNowPlaying`, `useVibrantColor`     |
| Variables / regular fns    | camelCase                        | `formatYear`, `isLoading`              |
| Module-scope const data    | SCREAMING_SNAKE_CASE             | `STORYBLOK_RELATIONS`, `STATUS_COLORS` |
| Module-scope const handles | camelCase                        | `tagRenderers`, `sizeConfig`           |
| Props interface            | `<Component>Props`               | `WorkCardProps`, `SbButtonProps`       |
| Boolean variables          | `is*` / `has*` / `can*`          | `isPlaying`, `hasVibrantColor`         |
| Event handlers             | `handle*` (local) / `on*` (prop) | `handleSeek`, `onAcceptAll`            |

For booleans, the prop on the receiving component is the noun (`disabled`, `priority`) but the local variable inside the implementation uses the predicate form (`isDisabled`, `isPriority`). Follow existing component contracts before inventing new prop names.

#### File and folder layout

| Kind                    | Style                     | Example                                          |
| ----------------------- | ------------------------- | ------------------------------------------------ |
| Directories             | kebab-case                | `work-card/`, `grid-item/`                       |
| Most source files       | kebab-case                | `work-card-date.tsx`, `spotify-id.ts`            |
| Sub-component files     | `<parent>-<child>.tsx`    | `work-card-meta.tsx`, `mp3-player.tsx`           |
| Per-folder helpers      | `lib.ts` (or scoped name) | `work-list/lib.ts`, `music-player/spotify-id.ts` |
| Tests                   | `<source>.test.ts(x)`     | `image-processing.test.ts`                       |
| Stories (storybook app) | `<Component>.stories.tsx` | `WorkCard.stories.tsx`                           |

One source file may not export more than one component. Subcomponents either move to a sibling file or stay private and unexported. Helpers > 20 LOC or shared between sibling components belong in a `lib.ts` next to them, not inlined.

#### Package-specific component conventions

The two component packages — `@httpjpg/ui` and `@httpjpg/storyblok-ui` — use deliberately different file conventions because they answer different questions.

**`@httpjpg/ui`** — generic primitives, no CMS coupling.

```
packages/ui/src/components/
  work-card/
    work-card.tsx         ← exports WorkCard (the public component)
    work-card-date.tsx    ← private subcomponent
    work-card-title.tsx
    work-card-meta.tsx
    work-card-tags.tsx
    work-card-content.tsx
    work-card.test.tsx    ← colocated test (optional)
```

- Folder name = kebab of component name.
- Main file = same name as folder, exports the PascalCase component.
- Sub-component files use the parent's kebab as a prefix (`work-card-*`) so they sort together and can't collide with siblings in `components/`.
- Re-export from `src/components/index.ts` via `export * from "./work-card/work-card"`.

**`@httpjpg/storyblok-ui`** — Storyblok blok renderers, each maps 1:1 to a CMS schema.

```
packages/storyblok-ui/src/components/
  work-card/
    SbWorkCard.tsx        ← exports SbWorkCard (matches "work_card" blok in Storyblok)
  grid-item/
    SbGridItem.tsx        ← exports SbGridItem (matches "grid_item" blok)
  page-work/
    SbPageWork.tsx        ← exports SbPageWork (matches "page_work" blok)
```

- Folder name = kebab of the blok name from `storyblok-sync/scripts/blocks/*.ts` (`work_card` → `work-card`).
- File name = `Sb<Pascal>.tsx` (PascalCase prefixed with `Sb`).
- Component name = `Sb<Pascal>` and matches the file name exactly.
- Props interface = `Sb<Pascal>Props`, with shape `{ blok: BlokSpacing & { _uid: string; … } }`.
- Re-exports from `src/index.ts` are **explicit**, not wildcarded: `export { SbButton, type SbButtonProps } from "./components/button/SbButton"`. This keeps the public surface auditable against the CMS component list.

The `Sb` prefix is mandatory in `storyblok-ui` for three reasons:

1. It marks the component as a CMS-driven blok, not a generic primitive.
2. It prevents collisions with the underlying `@httpjpg/ui` primitive (`SbImage` wraps `Image`, `SbButton` wraps `Button`).
3. It makes the `storyblokInit` registry mapping (`{ work_card: SbWorkCard }`) read symmetrically.

When you add a new blok:

1. Add the schema to `packages/storyblok-sync/scripts/blocks/<group>.ts`.
2. Run `pnpm --filter @httpjpg/storyblok-sync sync:components` (and `sync:datasources` if it uses new options).
3. Add a folder `packages/storyblok-ui/src/components/<kebab>/Sb<Pascal>.tsx` that consumes the matching `@httpjpg/ui` primitive.
4. Export it explicitly from `packages/storyblok-ui/src/index.ts`.
5. Register it in `apps/portfolio/lib/storyblok.ts` (`components` map, key = blok name).

#### Helper files

- Pure / hook-free helpers next to a component go in `lib.ts` (singular). Bigger or cross-component utilities move up to `src/lib/`.
- Build-time-only helpers live outside `src/` so they can't accidentally ship in the runtime bundle — see `packages/ui/panda.helpers.ts`.
- One concern per helper file. `spotify-id.ts` parses a Spotify URL; it doesn't also render a button.

---

## React & Next.js Patterns

- **Server Components by default.** Add `"use client"` only when you need state, effects, browser APIs, refs, or event handlers.
- **Keep client boundaries small.** Wrap interactive pieces in their own component; don't promote a whole layout to client just to use a hook.
- **Data fetching is server-side.** Use `@httpjpg/storyblok-next`'s `fetchStory` (cached) or `@httpjpg/storyblok-api`'s `getStoryblokApi` (uncached) inside Server Components and route handlers. Don't fetch Storyblok from the client.
- **Per-request dedupe with `cache()`** — `lib/queries/work.ts` exposes `getCachedStory` wrapped in `react.cache` so `generateMetadata` + the page body share one Storyblok roundtrip.
- **Errors** — return `notFound()` for missing stories, throw from route handlers only when a 500 is the correct outcome. Don't swallow Storyblok errors silently in user-facing paths; do log to Sentry via `@httpjpg/observability`.

---

## Storyblok Integration Patterns

- **Component registry** — `apps/portfolio/lib/storyblok.ts` calls `storyblokInit` once at module load. Both server entry (`app/layout.tsx`) and client entry (`StoryblokProvider`) import it so the registry exists in both contexts. In dev a `_fallback: SbMissing` slot is added so unknown bloks render a placeholder instead of breaking the page.
- **Editable attributes** — every `Sb*` component spreads `editableAttrs(blok)` on its root element to enable the Storyblok Visual Editor click-to-edit overlay.
- **Spacing schema** — bloks declare a 24-field spacing matrix (8 axes × 3 breakpoints). The CMS-side schema is generated by `withSpacing()` in `storyblok-sync/scripts/lib/spacing.ts`; the runtime consumer is `BlokSpacing` + `spacingCss()` in `storyblok-ui/src/lib/use-blok.ts`. Keep them in lock-step.
- **Draft mode** — `getStoryblokApi({ draftMode: true })` swaps to `STORYBLOK_PREVIEW_TOKEN` and `version: "draft"`. `proxy.ts` validates the Storyblok preview-token hash before letting a request enter draft mode.
- **Cache invalidation** — `app/api/revalidate/route.ts` is the webhook handler. It revalidates the `STORY(slug)`, `STORIES`, and `CONFIG` tags from `@httpjpg/storyblok-next` plus relevant paths.
- **`CMS_OPTIONS`** is the contract between design tokens, the Panda `staticCss` pass, and the Storyblok datasource entries. Adding a new option means: edit `storyblok-utils/src/cms-options.ts`, run `pnpm --filter @httpjpg/storyblok-sync sync:datasources`, rebuild `ui`.

---

## Panda CSS Conventions

- Reach for the `css({})` function from `styled-system/css` for one-off styles; reach for `<Box css={…}>` from `@httpjpg/ui` for component composition.
- **Use tokens, not hex.** When a value matches a token, use it (`bg: "primary.500"`, `color: "pageFg"`, `gap: 4`). Hex/rgb is reserved for genuinely off-palette decoration (e.g. the rainbow loading gradient).
- For dynamic values in inline `style={…}`, use `token.var("colors.success.500")` (resolves to `var(--colors-success-500)` at build time).
- Semantic color tokens (`pageBg`, `pageFg`, `pageBorder`) flip between light and dark themes. Use them over raw palette scales for surfaces that should respect theme switching.
- Build-time-only helpers (currently `hexToRgba`, `linearGradient`) live in `packages/ui/panda.helpers.ts`. Never re-export build helpers from the runtime index.

---

## Caching & Revalidation

- **Story caching is centralised in `@httpjpg/storyblok-next`.** All cached reads go through `fetchStory()` so the tag set stays consistent.
- **Cache tags** — `CACHE_TAGS.STORY(slug)`, `CACHE_TAGS.STORIES`, `CACHE_TAGS.CONFIG`. Use `revalidateTag` from `next/cache` in webhook/route handlers, never bare strings.
- **Default TTL is 1 hour** plus webhook-driven invalidation. Don't ship per-call ad-hoc TTLs without a reason.
- **Per-request dedupe** uses `react.cache()` (see `getCachedStory` in `lib/queries/work.ts`). This is request-scoped and cheap; cache loaders, not raw API calls.

---

## Site Search & Ask

The command palette (`⌘K` / `Ctrl+K`) is one feature with two halves, and they share a corpus.

- **One index, two consumers.** `getSearchIndex()` in `lib/queries/search-index.ts` flattens every published story into `SearchDocument[]` — title, tags, href, and a text excerpt gathered by `collectStoryText()` from an allowlist of content keys. It is cached under `CACHE_TAGS.STORIES`, so the existing publish webhook already invalidates it. Both search and the AI answer read that one snapshot; do not add a second corpus.
- **Ranking is lexical and pure.** `rankDocuments()` and `suggestCompletions()` in `lib/search/ranking.ts` take documents in and give results out — no I/O, no React. Autocomplete is deliberately not an AI call: it fires on every keystroke and must stay free and instant.
- **`GET /api/search`** returns `{ results, suggestions }`. **`POST /api/ask`** streams NDJSON — one `sources` line first so the widget can render citations, then `delta` lines, then either a closing `action` line or an in-band `error` line if the upstream fails after the 200 has been sent. Both go through `enforceRateLimit`.
- **The `action` line is derived, not asked for.** `firstCitedSource()` in `lib/search/citations.ts` reads the first `[n]` out of the finished answer and resolves it against the sources already sent, so the palette can offer "go to X" without a second model call and without any way to invent a link. External and uncited answers get no action; `readAskStream` re-checks that the href is same-origin before yielding it.
- **AI is optional.** No `GROQ_API_KEY` means `/api/ask` answers 503 and the palette hides the ask affordance; search, autocomplete, and navigation keep working. Never make search depend on the model.
- **Answers are grounded.** `buildAskMessages()` in `lib/search/prompt.ts` owns the system prompt and numbers the sources for citation. Prompts live in the app, never in `@httpjpg/groq`.
- **UI split.** `CommandPalette` in `@httpjpg/ui` is presentational and fully controlled (hence its Storybook stories); `AskWidget` in `components/widgets/` owns fetching, debouncing, and aborts. Keep that line — the palette must stay storyable without a network.
- **Opening it.** `⌘K` / `Ctrl+K`, or the header's `SearchTrigger`. The trigger lives in a different subtree from the widget, so it dispatches the `OPEN_SEARCH_EVENT` window event and `AskWidget` listens — the same arrangement as the Footer's `OPEN_COOKIE_SETTINGS_EVENT`. Never make the trigger keyboard-only: touch visitors have no other way in.

---

## Work Tags

Tags are a controlled vocabulary, not free text, because three spellings of "TypeScript" are three tags to a ranker and one to a human.

- **The catalog is code.** `WORK_TAGS` in `packages/storyblok-utils/src/work-tags.ts` is the single source of truth: a `value` (stored, stable, never renamed), a `label` (displayed), and a `group`. `sync:datasources` pushes it to the `work-tags` datasource, and the `tags` field on the `work` blok is a datasource-backed multi-select — so the editor picks, never types. Adding a tag: edit the catalog, run `pnpm --filter @httpjpg/storyblok-sync sync:datasources`.
- **Values and labels do different jobs.** `SearchDocument.tagValues` carries the canonical values; `SearchDocument.tags` carries display labels and is what the UI renders. Search matches both. `resolveWorkTags()` drops anything outside the vocabulary rather than rendering a raw slug, which is what makes retiring a tag safe without a content migration.
- **`tagValues` is optional on purpose.** The search index is persisted by `unstable_cache`, so for up to an hour after a deploy the previous build's documents are still being served. Every reader has to tolerate their absence.
- **Related work is rarity-weighted.** `relatedDocuments()` in `lib/search/related.ts` scores shared tags by how rare they are in the corpus — two stories both tagged "web" say nothing on a site where everything is web. It reads the same index search and ask read, so a story cannot be findable by a tag and unrelated by it. Untagged stories get no neighbours; padding the strip with recent-but-unrelated work would duplicate the prev/next nav sitting right below it. Because that emptiness is indistinguishable from `related_work_enabled` being off, the section renders a one-line diagnostic instead — but only under draft mode or `pnpm dev`, never in production.
- **Story-level Storyblok tags are a separate axis, and load-bearing.** `tag_list` says where a story belongs — `Projects` and `Websites` drive the work-list split and the header nav, and that logic lives in `lib/queries/work.ts`. `content.tags` says what a story is about. Nothing reads `tag_list` for description: cards and the search index render the curated vocabulary only, so the two never mix and renaming a tag in one axis can never disturb the other.

---

## Page-wide Audio

Audio outlives a page change, the way the iOS app's `AudioPlayerModel` does.

- **One engine, mounted once.** `AudioPlayerProvider` in `@httpjpg/ui` owns the site's only `<audio>` element and sits in `app/layout.tsx`. App Router keeps the root layout mounted across client navigations — that, and nothing else, is what keeps a track playing. Never mount a second one, and never move it into a route segment.
- **The seam is a context, not a prop.** `useAudioPlayer()` returns `null` outside the provider, mirroring the `\.playAudioTrack` environment key on iOS, so `MusicPlayer` and friends stay renderable in Storybook and tests without an engine behind them.
- **Bloks hand tracks over, they don't play them.** With a provider mounted, a `music_player` blok in mp3 mode renders `AudioTrackRow` — metadata plus one button that calls `play()`. Without one it falls back to the self-contained `MP3Player`. The Spotify and SoundCloud embeds bring their own transport and stay out of the queue.
- **The queue is the page, snapshotted.** Every mounted mp3 blok registers itself through `useAudioQueueEntry`; `play()` freezes that registry into the queue it walks, so next/prev keep working after the bloks that supplied them unmount.
- **Controls live in the header.** `MiniPlayerSlot` renders the record and prev/play/next/✕ right behind the `SearchTrigger`, in both the mobile block and `Navigation`. It renders nothing until something is loaded — the nav copy is untouched for visitors who never press play. `MiniPlayer` itself is presentational and fully controlled, same split as `CommandPalette` / `AskWidget`. The phone gets the pared-back version: no cover art, no spin, no clock.
- **The record links home.** `registerTrack` stamps each entry with the pathname it mounted on, and the record links back to it through `Link`, i.e. `next/link`. It has to stay a client navigation — a document reload would stop the very playback the header is reporting.
- **`navigator.mediaSession`** carries the metadata and the lock-screen transport, the web counterpart of the app's `MPRemoteCommandCenter` wiring.

---

## Lightbox

Enlarging a picture is a modal overlay, and it follows the same shape as the command palette rather than inventing a second one.

- **Controlled, like `CommandPalette`.** `Lightbox` in `@httpjpg/ui` takes `open` / `index` / `items` and reports back through `onClose` / `onIndexChange`. It holds no state of its own, so it stays storyable without a network or a click. `useLightbox()` is the other half for callers that just want a gallery — the same presentational/stateful split as `CommandPalette` / `AskWidget`.
- **The portal has to restate the theme.** Panda's `_pageDark` condition is `[data-theme=dark] &`, and the overlay renders into `document.body` — outside the element carrying the attribute, `<html>` in the app and a decorator `<div>` in Storybook. `usePageTheme()` reads the page's value and the portal root repeats it, which is the only reason `pageBg` / `pageFg` / `pageBorder` resolve to the page's theme instead of always light. Any future portalled overlay needs the same treatment; the command palette predates it.
- **The trigger is a sibling, not a wrapper.** `LightboxTrigger`'s default `cover` variant is a transparent button stretched over a positioned parent. `<button>` takes phrasing content, and the zoomable thing is an image _plus_ its ASCII overlay and credit — wrapping that would be invalid markup, so it is overlaid instead. Anything carrying its own controls takes the `corner` variant instead: a full-size hit area over a video swallows the play button.
- **Chrome is ASCII, not iconography.** Counter as `[ 02 / 05 ]` on `padStart(2, "0")` — the same format the slideshow counter uses — and controls as `[ ← ]` `[ → ]` `[ esc ]` in mono. `IconButton` is deliberately not used here; the register matches the command palette's `ask ⌘↵` footer.
- **Navigation wraps, and the index is clamped.** Past the last item comes the first. An out-of-range `index` is clamped rather than blanking the frame, because the Visual Editor reorders and deletes assets underneath a remembered index. Arrow keys, the buttons, and a horizontal swipe all go through one `step()`.
- **Neighbours are preloaded.** On open and on every move, the next and previous `src` are warmed so a click lands on a decoded image. Browsers dedupe against the cache, so it costs one request per image at most.
- **Credit reads straight.** The `inline-*` copyright positions rotate the credit into the image's corner, which suits a cropped thumbnail and fights a contained full-size view — so the lightbox always renders `CopyrightLabel`'s `below` variant, in a bar under the frame.
- **An item can be a video.** `LightboxItem.video` swaps the `<img>` for the `Video` component, embed sources included. It is bounded by width where a still is bounded by height: an embed's intrinsic size cannot be measured from outside the iframe. Preloading skips them — the player streams.
- **Two bloks opt in, and only two.** `lightbox` is a boolean on the `image` and `video` schemas, and each opens itself. The `slideshow` blok deliberately has no toggle: it already owns a transport, and layering a second one over it is a different feature. `items` is still an array, so a future gallery needs no change to `Lightbox` — but grouping separate bloks means a page-level registry like the audio queue's, not a wider prop.
- **`imagePreset.full`** is the rendition it shows: 2560px wide, uncropped, matching the top of `DEFAULT_RESPONSIVE_WIDTHS` so opening an image the page already fetched at full width is usually a cache hit.

---

## Env, Config, Observability

- **Env access** — always `import { env } from "@httpjpg/env"`. Never `process.env.FOO` outside `env.mjs` (the one exception is `NODE_ENV` checks, which the t3-oss layer also exposes).
- **Adding a new env var** — declare in `packages/env/src/env.mjs` (server or client section), wire `runtimeEnv`, add to `turbo.json`'s `globalEnv` or the relevant task `env` if it affects builds.
- **Sentry** — use `captureClientException`, `captureServerException`, `captureEdgeException` from `@httpjpg/observability/sentry/{client,server,edge}`. Don't import `@sentry/nextjs` directly in apps.
- **App config** — non-secret, non-CMS settings sit in `apps/portfolio/lib/config.ts` as a typed `as const satisfies AppConfig`. CMS-driven settings come from the Storyblok config story via `lib/queries/config.ts`.

---

## Forms & Validation

The portfolio site has no forms. If you add one:

- Use `react-hook-form` for state.
- Use `zod` (catalog version 4) for the schema, colocated next to the consumer.
- Don't pull in any UI form library — compose with existing `@httpjpg/ui` primitives.

---

## Testing

- **Unit tests** — Vitest with `jsdom` environment by default; switch to node per file via `// @vitest-environment node` at the top of the file (see `packages/spotify/src/api.test.ts`). Globals (`describe`, `it`, `expect`, `vi`) are enabled — no need to import from `vitest` unless you need typed helpers like `MockedFunction`. Tests live next to source as `*.test.ts(x)`. Run with `pnpm test` at the root; single root `vitest.config.ts` discovers all package tests.
- **Component tests** — `@testing-library/react` + `@testing-library/jest-dom/vitest`. Existing examples in `packages/ui/src/components/{box,button,headline}/*.test.tsx`.
- **E2E** — Playwright specs in `apps/portfolio/tests/e2e`. Run with `pnpm --filter @httpjpg/portfolio test:e2e`.
- **Visual regression** — Playwright specs in `apps/storybook/tests/visual`. Every story is photographed and compared against the set `main` last published to the GitHub Actions cache; nothing is stored in the repo. Locally, `pnpm --filter @httpjpg/storybook test:visual:smoke` renders every story without comparing.
- **CI** — `.github/workflows/ci.yml` runs lint → typecheck → test → build → e2e → visual.

### Visual regression rules

`main` is the baseline: a push re-takes every screenshot and publishes the set to the Actions cache, a pull request restores that set and compares. A pull request that changes rendering fails, uploads the expected/actual/diff images as the `visual-report` artifact, and comments with which stories moved and by how many pixels.

- **One renderer.** Local scripts and CI both shell out to `mcr.microsoft.com/playwright:v<version>-noble` via `apps/storybook/scripts/visual-docker.sh`, which reads the version from the installed `@playwright/test`. Never take a baseline outside that container, and never put `{platform}` back into `snapshotPathTemplate` — there is one baseline set. Bumping `@playwright/test` re-renders text, so dispatch **Visual Baselines** against `main` afterwards.
- **Baselines are never committed.** `apps/storybook/tests/visual/__screenshots__` is gitignored; anything taken locally is local. Caches written on `main` are readable from every branch, caches written elsewhere are not — publishing from another branch is pointless. This is also why `test:visual` is not a cacheable turbo task: turbo excludes ignored files from its hash, so a hit would report a stale pass.
- **Nothing external is fetched.** `prepareStory()` in `tests/visual/lib.ts` answers every non-local request itself: images get a fixed placeholder (so `onLoad` fires and skeletons clear), everything else is aborted. A story that needs the real Storyblok CDN to look right will flake — give it a local fixture instead.
- **Coverage is tag-driven.** `skip-visual` on a story or meta keeps it out; `visual-mobile` additionally captures it at 390×844. Don't add a bespoke opt-out, and don't disable a story to silence a diff.
- **Accepting is a label, not a merge.** `visual-approved` on the pull request makes the job pass; the diff is still computed, reported and uploaded. The gate is deliberately narrow: it consults `visual-summary.mjs --verdict` first and honours the label only when every failure was a screenshot mismatch, so a build, Docker or runner failure stays fatal. The label must also post-date the commit under test, and `.github/workflows/visual-approval-reset.yml` drops it on every push — one approval cannot cover a later rendering. Both the label and its timestamp come from the API rather than the event payload, because "Re-run failed jobs" replays the original payload, where a label added after the fact is invisible.
- **A missing baseline warns, it does not fail.** Before `main` has published a set, or after a 7-day cache eviction, the job passes with a warning rather than failing on 361 missing files. Individually missing baselines are a different case, and the one a new story hits: Playwright _fails_ the run that writes a snapshot for the first time, so `visual-summary.mjs` sorts those out by their `snapshot doesn't exist` message and the gate passes them on the `baselines-added` verdict. That is deliberate — a story with nothing to compare against is not a regression, and no label could describe one. Merging is what takes its baseline. The classification is ranked, so a new story sitting next to a real difference still needs the label, and next to a crash still fails.
- **Chromatic still runs, but only publishes.** The `chromatic` job uploads the built Storybook so each run has a browsable one; snapshots are switched off in the Chromatic project settings (UI Tests and UI Review), and there is no CLI flag for it. Publishing is unmetered, snapshots are not — that split is the whole point. Don't hand it back the testing role.

---

## Tooling

```bash
pnpm dev              # turbo run dev — all watchers
pnpm dev:portfolio    # only the portfolio app + its deps
pnpm dev:storybook    # only Storybook + its deps
pnpm build            # PANDA_PRODUCTION=1 turbo run build
pnpm type-check       # turbo run type-check (all packages + apps)
pnpm test             # workspace-wide Vitest
pnpm test:visual      # story screenshots vs. whatever is in __screenshots__ (needs Docker)
pnpm test:visual:update  # (re)take the local screenshot set
pnpm lint             # oxlint, root only
pnpm lint:fix
pnpm format           # oxfmt
pnpm format:check
```

### Code quality

- Lint and format must be clean before committing (`lint-staged` enforces it via Husky `pre-commit`).
- Commit messages follow Conventional Commits (`commitlint` runs on `commit-msg`).
- No console.log in shipped code paths; `console.error` / `console.warn` are acceptable for genuine error reporting that complements Sentry.

### Releases

Automated by release-please (`.github/workflows/release.yml`, `release-please-config.json`, `.release-please-manifest.json`). One version for the whole repo — the root `package.json` — because nothing is published to npm and every workspace package stays `private` at `0.0.0`.

**Never hand-edit** the root `package.json` version, `.release-please-manifest.json`, or the newest `CHANGELOG.md` section outside of an open `chore(release):` PR. The tooling owns all three.

The loop: a conventional commit lands on `main` → release-please opens or updates one `chore(release): <version>` PR with the version bump and a generated changelog section → **a human curates that PR** (the generated entries are commit subjects; this changelog is written in prose) → merging it tags `v<version>`, publishes the GitHub Release, and cuts the matching Sentry release. Nothing ships until that PR is merged, and leaving it open is safe.

Curate late: release-please regenerates the changelog whenever a new commit lands on `main`, discarding manual edits. `### Removed` has no commit type behind it — add it by hand.

The commit type decides both the changelog section and the bump:

| Type                             | Section      | Version bump |
| -------------------------------- | ------------ | ------------ |
| `feat`                           | Added        | minor        |
| `fix`                            | Fixed        | patch        |
| `refactor`, `style`, `revert`    | Changed      | patch        |
| `perf`                           | Performance  | patch        |
| `build`, `ci`, `docs`, `test`    | Tooling      | patch        |
| `deps`                           | Dependencies | patch        |
| `chore`                          | _hidden_     | patch        |
| any type with `BREAKING CHANGE:` | ⚠ BREAKING   | major        |

**Every** conventional commit bumps at least the patch version — `hidden: true` only keeps `chore` out of the changelog, it does not stop the bump. A Renovate-only week therefore leaves an open release PR at `x.y.z+1`; whether that is worth shipping is a human call. Renovate commits as `deps:` (`:semanticCommitTypeAll(deps)`) so dependency updates land under Dependencies instead of vanishing into the hidden `chore` section.

To override the computed version, put `Release-As: 3.0.0` in a commit body (an empty commit works).

Two things that follow from this and are easy to trip over:

- `ci.yml`'s `guard` job skips the pipeline for `release-please--*` branches — the release PR only touches `package.json` and `CHANGELOG.md`, and its commits already passed on `main`. The jobs are skipped individually rather than the workflow being filtered out with `paths-ignore` or `[skip ci]`: `All checks passed` is a required status check on `main`, and a required check that is never created leaves the PR blocked forever, whereas a skipped job counts as passed. The `ci` job itself runs (`if: always()`) and reports in seconds, which is what satisfies the branch rule. This is also why the release PR must be opened by the bot App or a PAT and not by `GITHUB_TOKEN` — events raised by `GITHUB_TOKEN` do not start workflow runs at all, so no check is ever reported and the PR cannot merge.
- `release-please-config.json` sets `"package-name": ""` on the root package, and it has to stay. release-please derives a branch component from the package name and, when tagging a merged release PR, compares it against the component in the PR's branch name. The manifest's Merge plugin puts the release on `release-please--branches--main`, which carries no component, so a non-empty package name makes every merged release PR fail the comparison — no tag, no GitHub Release, and every later run aborts with `There are untagged, merged release PRs outstanding`. `include-component-in-tag: false` does not help; `getBranchComponent()` ignores it.
- `resolveAppVersion()` in `apps/portfolio/next.config.ts` resolves the env var, then `git describe --tags`, then the latest GitHub Release, then a commit SHA. The deploy build sets no env var, so it lands on the tag — the same name the `sentry-release` job uploads sourcemaps under, which is what makes production stack traces symbolicate. CI's `main` builds keep using `github.sha`.

The release PR is authored by the **httpjpg-bot** GitHub App: `release.yml` mints an installation token with `actions/create-github-app-token` from `HTTPJPG_BOT_APP_ID` + `HTTPJPG_BOT_PRIVATE_KEY` (App permissions: Contents, Issues and Pull requests, all read & write — Issues is what release-please labels through). The token falls back to `RELEASE_PLEASE_TOKEN` and then `GITHUB_TOKEN`, but only the first two can start workflow runs — see the required-check note above.

The Sentry job degrades to a warning when `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` are missing, and its `set-commits --auto` step is `continue-on-error` because it needs Sentry's GitHub integration connected.

### Adding dependencies

- Use `pnpm add` from the **specific package directory**, not the root.
- If the dependency is already in `pnpm-workspace.yaml`'s `catalog:`, reference it via `"<dep>": "catalog:"` in the package.json.
- Workspace siblings go in as `"@httpjpg/<name>": "workspace:*"`.
- Match dependency placement to use: peer deps for things the consumer must own a single copy of (React, `@httpjpg/ui` when used as a peer), regular deps for everything else.

---

## When in Doubt

1. Open a neighboring file in the same package and copy the shape.
2. Prefer fewer abstractions; three similar lines beat a half-baked helper.
3. Keep changes scoped — one PR shouldn't refactor and add features at the same time.
4. If you have to choose between matching the existing convention and an objectively better pattern, match the convention and surface the better pattern in the PR description.
5. Ask for clarification rather than guessing CMS field names, cache tag semantics, or layout intent.
