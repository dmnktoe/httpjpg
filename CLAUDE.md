# Coding Agent Guidelines

> Guide for AI coding agents working in the httpjpg monorepo. Mirror existing conventions; don't invent new patterns without a strong reason.

## Purpose

This is a brutalist portfolio site driven by Storyblok CMS, rendered by Next.js, styled with Panda CSS (zero-runtime), built on a pnpm + Turbo monorepo.

When generating or updating code: read neighboring files first, prefer the existing pattern over an inventive one, keep changes scoped.

---

## Technology Stack

- **TypeScript** — strict mode, `interface` for object shapes, no `enum`
- **Node.js** ≥ 22.12 (pinned via `.nvmrc` to 22.22.3), ESM-only (`"type": "module"` in every workspace package; the private root `package.json` does not declare it)
- **Next.js 16** App Router — Server Components by default, route handlers in `app/api/*`
- **React 19** — functional components only
- **Panda CSS** (zero-runtime) — `css({})` / `cx()` / token-aware patterns; consumes design tokens from `@httpjpg/tokens`
- **Storyblok** as CMS — Visual Editor live-bridge in dev, draft mode in production
- **Sentry** — error reporting via `@httpjpg/observability` for client/server/edge
- **Vitest** for unit tests (jsdom by default, node env via `// @vitest-environment node` pragma), **Playwright** for E2E in `apps/portfolio/tests/e2e`
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
│   │   │   └── widgets/         # Discord, PSN, now-playing, flag counter, web vitals
│   │   ├── lib/
│   │   │   ├── queries/         # Storyblok data fetchers (config, work, widgets, last-updated)
│   │   │   ├── integrations/    # Third-party API adapters (discord/Lanyard, …)
│   │   │   ├── page-theme.ts    # Light/dark resolution from headers + draft mode
│   │   │   ├── seo.ts           # Story → Next Metadata mapping
│   │   │   ├── schema-org.tsx   # JSON-LD generation
│   │   │   ├── storyblok.ts     # Component registry init (server + client side-effect)
│   │   │   └── storyblok-slugs.ts
│   │   ├── proxy.ts             # Edge middleware: preview-token validation, CSP, x-pathname
│   │   └── instrumentation.ts   # Sentry boot for server + edge
│   └── storybook/               # Storybook for @httpjpg/ui component dev/docs
│
├── packages/
│   ├── analytics/               # Google Analytics gtag wrapper
│   ├── consent/                 # Cookie consent state + banner UI + vendor catalog
│   ├── env/                     # Env validation (t3-oss + zod), edge-safe loader
│   ├── now-playing/             # Draggable "now playing" widget UI
│   ├── observability/           # Sentry init for client / server / edge
│   ├── spotify/                 # Spotify API client + useNowPlaying hook + color extraction
│   ├── storyblok-api/           # Raw Storyblok CDN client (framework-agnostic)
│   ├── storyblok-next/          # Next.js caching layer on top of storyblok-api
│   ├── storyblok-richtext/      # Renders Storyblok richtext docs through a tag-handler map
│   ├── storyblok-sync/          # CLI tool: push schemas + datasources via Management API
│   ├── storyblok-ui/            # Sb* blok components consuming @httpjpg/ui
│   ├── storyblok-utils/         # Storyblok runtime types, image presets/processing, cms-options
│   ├── tokens/                  # Design tokens (colors, typography, spacing, …) + CSS-var generator
│   └── ui/                      # Core UI component library (Panda CSS)
│
├── tsconfig/                    # Shared TS configs: base, nextjs, react-library
├── test/config/                 # Workspace Vitest setup file
├── turbo.json                   # Task graph, cached inputs/outputs, env passthrough
└── pnpm-workspace.yaml          # Catalog versions for react, typescript, dotenv, …
```

### Package Responsibilities

#### Apps

- **`@httpjpg/portfolio`** — the deployed Next.js site. Owns all routes, app-specific widgets, data-fetching queries, SEO, schema-org, and integrations.
- **`@httpjpg/storybook`** — Storybook host for documenting and developing `@httpjpg/ui` and `@httpjpg/now-playing` components in isolation. Not deployed.

#### Foundations (no workspace deps)

- **`@httpjpg/env`** — runtime env contract via `@t3-oss/env-nextjs` + `zod`. Edge-safe: `load-env.js` only fires under Node, skipped on edge.
- **`@httpjpg/tokens`** — single source of truth for design tokens (colors, typography, spacing, shadows, opacity, sizes, transitions, borderRadius, z-index). Pure data; granular subpath exports per token family. Build script generates `dist/tokens.css` with CSS variables.

#### Core UI

- **`@httpjpg/ui`** — component library built on Panda CSS. Exports primitives (`Box`, `Stack`, `Grid`, `Container`), typography (`Headline`, `Paragraph`), media (`Image`, `Video`, `Slideshow`), navigation (`Header`, `Footer`, `Link`, `NavLink`), interactive widgets (`MusicPlayer`, `CustomCursor`, `MouseTrail`, `WorkCard`, `WorkList`), and structural pieces (`Page`, `Section`, `Divider`). Owns `panda.config.ts` and the generated `styled-system/`. The runtime `src/lib/` only contains format and external-link helpers; build-time helpers live in `panda.helpers.ts` next to the panda config.

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
- **`@httpjpg/storyblok-api`** — raw CDN client (`getStoryblokApi()`). No Next.js coupling, works in edge workers and scripts. Returns `{ client, getStory, getStories, getAllSlugs }`.
- **`@httpjpg/storyblok-next`** — Next.js cache layer on top. Owns `fetchStory()` (uses `unstable_cache` with `STORY(slug)` + `STORIES` tags, 1 h revalidate, draft mode bypass) and `CACHE_TAGS`. Apps import from here when they need cached fetches.
- **`@httpjpg/storyblok-richtext`** — renders a Storyblok richtext document to React via a `Record<tag, TagRenderer>` map. Custom Tiptap extensions for image copyright and inline code.
- **`@httpjpg/storyblok-ui`** — `Sb*` blok components (e.g. `SbPage`, `SbWorkList`, `SbImage`, `SbMusicPlayer`) that consume `@httpjpg/ui` primitives and the `BlokSpacing` schema. Re-exports the runtime types from `storyblok-utils` for app convenience and exposes `storyblokInit` / `apiPlugin`.
- **`@httpjpg/storyblok-sync`** — `tsx`-driven CLI under `scripts/`. Pushes component schemas and datasources to Storyblok via the Management API. Reads `CMS_OPTIONS` from `storyblok-utils` and tokens from `@httpjpg/tokens` to keep the CMS contract in lock-step with the design system. Not imported at runtime.

#### Integrations & widgets

- **`@httpjpg/spotify`** — Spotify Web API client (server-side, uses `Buffer`), `useNowPlaying` polling hook, and `extractVibrantColor` (colorthief wrapper) for album-artwork color extraction.
- **`@httpjpg/now-playing`** — the actual draggable widget UI. Consumes `@httpjpg/spotify` for color extraction and `@httpjpg/ui` (peer) for `Marquee`. UI-only — no API or hook logic lives here.
- **`@httpjpg/analytics`** — analytics wrappers (Google Analytics 4 under `src/google/`, privacy-first Umami under `src/umami/`). Both are thin, consent-gated, env-driven wrappers; track-functions follow `track*` naming and fan out to whichever providers are configured.
- **`@httpjpg/observability`** — Sentry init for the three Next runtimes. `getSentryConfig(scope)` resolves DSN, env, production flag, and enabled state per runtime.
- **`@httpjpg/consent`** — cookie consent state machine (`getConsent`, `setConsent`, `hasVendorConsent`, …), the `CookieBanner` (portal-rendered) + `CookieCategory` + `VendorList` UI, and the vendor catalog (`EXTERNAL_VENDORS`).

### Path Aliases

Only `apps/portfolio` defines an alias:

| Alias | Path               |
| ----- | ------------------ |
| `@/*` | `apps/portfolio/*` |

Across packages, always import workspace siblings via their package name (`@httpjpg/<name>`), never via relative paths into `../../<package>/src`.

### Dependency Direction Rules

- Tokens and env are leaves — they must not depend on anything in the workspace.
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
- **No default exports** anywhere outside `apps/portfolio/app/**` — Next.js App Router requires defaults for `page.tsx` / `layout.tsx` / `loading.tsx` / `error.tsx` / `not-found.tsx` / `route.ts`, and nowhere else.
- **One exported component per file.** Subcomponents either go in sibling files (preferred when ≥ 30 lines or reused) or stay private and unexported.
- **File layout inside a component file:** exports first (props interface → component), then private subcomponents, then helpers, then static constants, then types-only.

### Naming

#### Identifiers

| Kind                       | Style                            | Example                                |
| -------------------------- | -------------------------------- | -------------------------------------- |
| Components & types         | PascalCase                       | `WorkCard`, `NavItem`, `BlokSpacing`   |
| Hooks                      | camelCase, `use` prefix          | `useNowPlaying`, `useVibrantColor`     |
| Variables / regular fns    | camelCase                        | `formatYear`, `isLoading`              |
| Module-scope const data    | SCREAMING_SNAKE_CASE             | `FALLBACK_NAVIGATION`, `STATUS_COLORS` |
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
- **CI** — `.github/workflows/ci.yml` runs lint → typecheck → test → build → e2e.

---

## Tooling

```bash
pnpm dev              # turbo run dev — all watchers
pnpm dev:portfolio    # only the portfolio app + its deps
pnpm dev:storybook    # only Storybook + its deps
pnpm build            # PANDA_PRODUCTION=1 turbo run build
pnpm type-check       # turbo run type-check (all packages + apps)
pnpm test             # workspace-wide Vitest
pnpm lint             # oxlint, root only
pnpm lint:fix
pnpm format           # oxfmt
pnpm format:check
```

### Code quality

- Lint and format must be clean before committing (`lint-staged` enforces it via Husky `pre-commit`).
- Commit messages follow Conventional Commits (`commitlint` runs on `commit-msg`).
- No console.log in shipped code paths; `console.error` / `console.warn` are acceptable for genuine error reporting that complements Sentry.

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
