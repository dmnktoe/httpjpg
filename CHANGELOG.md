# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-06-04

### Added

- **UI**: a `Checkbox` primitive in `@httpjpg/ui` — a pure-monospace tribal indicator (angle brackets holding a diamond mark, `‹ ›` → `‹◆›`) in the accent color. The mark sits in a fixed 1ch slot so the control never changes width between states, the native input is kept for accessibility/keyboard, and a peer focus ring is exposed. Wired into the consent `CookieCategory` (the title becomes a `htmlFor` label) and documented with Storybook stories.

### Tooling

- **Lint**: a custom `panda/sort-properties` oxlint plugin that sorts Panda style properties into a fixed, group-based order (layout → box → flex/grid → sizing → spacing → color/typography → background → border → effects → transform/transition → interactivity). Scoped to `css()`, orders shorthands before their longhands so the resolved cascade never changes, ranks responsive object values by property, recurses into nested objects, and bails safely on spreads, computed keys, and commented objects. Ships with autofix and is tracked in Turbo's global cache inputs (`tools/oxlint/**`).
- **Lint**: applied the `panda/sort-properties` autofix repo-wide (pure property reordering, no behavioral changes) and flipped the rule from warning to error so unsorted Panda style properties now fail CI.

## [2.0.0] - 2026-06-04

### Breaking

- **UI / Buttons**: removed the `outline` and `disabled` button variants entirely (no back-compat). The variant set is now `primary` (blue), `secondary` (neutral grey), `accent` (lime), and `danger` (red), with flat fills and no gradient. The matching Storyblok button + cta schema options were dropped — run `pnpm --filter @httpjpg/storyblok-sync sync:components`.
- **Tokens / CMS**: removed the rose `secondary` color palette from the design tokens and the CMS color datasource. Run `pnpm --filter @httpjpg/storyblok-sync sync:datasources` to drop the Secondary swatches from the live color picker.
- **Work taxonomy**: renamed the binary work split from personal/client to projects/websites — `PERSONAL_TAG`/`CLIENT_TAG` → `PROJECTS_TAG`/`WEBSITES_TAG`, `getRecentWork()` keys → `projectsWork`/`websitesWork`, the Header/Navigation/MobileMenu props, the NavLink recipe variant keys (`personal`/`client` → `projects`/`websites`), and `TAXONOMY_TAGS`. Existing Storyblok stories must be re-tagged (Client → Websites; Personal → Projects or untagged).
- **Consent**: stored consent is now versioned (`CONSENT_VERSION`); older and legacy unversioned cookies are discarded, so every visitor is prompted for a fresh decision. Removed the `window.__openCookieSettings` global and the `ConsentConfig` type; `OPEN_COOKIE_SETTINGS_EVENT` moved to `@httpjpg/ui`.

### Added

- **Analytics**: privacy-first Umami integration alongside Google Analytics — a `UmamiAnalytics` script component, provider-agnostic domain events that fan out to every configured provider, an `umami` consent vendor, and `NEXT_PUBLIC_UMAMI_ID` / `NEXT_PUBLIC_UMAMI_SRC` env. Cookieless and DNT-respecting.
- **Consent**: a `/cookie-policy` page with an inline `CookieCenter` preference manager, a reactive store layer (`useConsent` / `useConsentCategory` / `useVendorConsent` built on `useSyncExternalStore`), an expanded cookie-banner intro with a live count of named third-party services and inline policy links, and a footer Cookie Policy link.
- **UI**: a `danger` button variant, plus Storybook Foundations pages for Z-Index, Border Radius, Opacity, Sizes, and Transitions, and a CookieBanner widget story.

### Changed

- **Analytics**: Google Analytics and Umami now load only behind a single `analytics` consent via a generic `ConsentGate`; neither tracker fires before consent is granted. `@httpjpg/analytics` is now a framework-agnostic leaf (react/next deps moved into the app).
- **UI**: the button and navLink recipes moved to build-time `*.recipe.ts` files colocated with their components, and the dead headline/paragraph recipe duplicates were dropped from `panda.config.ts`. The accent token is now lime green and secondary buttons use the neutral scale.
- **Observability**: explicit Sentry capture added to catch-and-fallback paths that never reach the `onRequestError` hook — the config / recent-work / adjacent-work / last-updated queries, sitemap generation, `generateStaticParams`, the revalidate / discord / spotify route handlers, and the `[...slug]` error boundary.
- **Deps**: `next` is now sourced from the pnpm catalog across packages.

### Fixed

- **Richtext**: the Storyblok Max Width option now controls prose width — ch classes are statically generated from `CMS_OPTIONS.proseMaxWidth`, `none` maps to no constraint, and an unset value defaults to 65ch.
- **UI**: disabled buttons no longer run hover transitions.
- **Consent**: guard the cookie decode against malformed percent-encoding (a bad `%` escape was white-screening the render), seed `CookieCenter` from the store on first render to avoid a flash to defaults, and keep the inline center in sync with the banner.

### Tooling

- **Observability**: added the missing `type-check` script so the package is no longer skipped by `turbo run type-check`.
- **Renovate**: dropped the `scope:` label prefix and the unused `scope:root` label.
- **Tests**: added consent-package unit tests (store, hooks, cookie banner, cookie center) plus `ConsentGate` and `UmamiAnalytics` tests.
- **Refactor**: cleaned up AI-slop patterns across the monorepo — surfaced silent catches, replaced `any` with real types, and converted plain arrow components to function declarations.

### Dependencies

- linting & formatting (oxlint + oxfmt) updated to `^0.53.0`.

## [1.5.0] - 2026-06-03

### Added

- **Studio**: new standalone `apps/studio` Next.js app — a dev-only drag-and-drop grid builder. Previews bloks with the real `@httpjpg/ui` components, a viewport switcher with per-breakpoint span/height, a viewport-scoped inspector covering the full 24-field `BlokSpacing` matrix, localStorage persistence with undo/redo and keyboard shortcuts, grid import via JSON paste or Storyblok fetch, and a collapsible live JSON preview. Each blok is a self-contained plugin, with option lists driven from `CMS_OPTIONS` and tokens.
- **OG**: dynamic editorial Open Graph images extended to every page, keeping the dedicated work layout.
- **UI**: new components — `Accordion`, `Callout`, `CodeBlock`, `Stats`, `ScrollClipImage`, `Icon`, `List`, and `Divider` — each with a matching `Sb*` blok renderer wired to generated blok types.
- **Storyblok**: new content/media/layout blok schemas backing the new components.
- **Storybook**: Utilities playground for the image CDN and `useParallax` hook, a Richtext story with `maxWidth` + tone controls, a native theme toolbar, and a redesigned brutalist Introduction page.

### Changed

- **Storyblok**: dropped `grid.isList` — it was semantically broken and unused.
- **Storybook**: derive Header mock data from shared fixtures.

### Fixed

- **Image overlay**: prevent page overflow without clipping edge decorations, make parallax usable, guard against empty/unknown pattern values, and use an own-property check for pattern validation (ES2021 compatibility).
- **Code block**: clear the copy-reset timeout on unmount.
- **OG**: address review findings — fetch timeout, UTC year, and work prefix.
- **Catch-all route**: treat `api/*` slugs as internal to silence crawler noise.
- **Studio**: grid-aligned guide columns and rows, always-visible resize handles, isolated studio layout, and guards against undefined `siteUrl`.
- **Paragraph**: dark-mode color fix.

### Style

- **Callout**: replace the solid border with a repeating stars pattern.
- **UI**: add ASCII decorators to the new components.
- **Console**: refresh the dev console banner.

### Tooling

- **Renovate**: slimmed the config and added Storyblok, React, Panda CSS, build-tooling, and Next.js dependency groups; swapped the Sentry group for a linting & formatting group (oxlint + oxfmt); dropped the labels-as-code setup.
- **Tests**: added unit tests for `Accordion`, `Callout`, `CodeBlock`, `Stats`, `ScrollClipImage`, `image-overlay`, and `use-parallax`.

### Dependencies

- `concurrently` updated to v10.
- `actions/download-artifact` updated to v8.
- `actions/checkout` digest updated to `df4cb1c`.
- `chromaui/action` digest updated to `d92ea1c`.

## [1.4.0] - 2026-05-30

### Added

- **Storyblok**: codegen pipeline that generates TypeScript types from blok schemas, wired into all `Sb*` components and replacing the manual config types with generated `Sb*Data`. Types are generated on install and no longer tracked in the repo.
- **Work list**: ASCII empty state rendered when no works are present.
- **Footer**: version number now links to the matching GitHub release with an underline-on-hover treatment.

### Changed

- **Footer**: version link moved into the base `Footer` component and `FooterWrapper` eliminated in favor of using `Footer` directly.
- **Config**: fallback navigation updated to Home, CV, Feed.

### Fixed

- **Analytics**: guard the `window.gtag` call with try/catch so a missing or throwing gtag no longer breaks tracking.
- **Work list**: always sync stories state when the work prop changes.
- **Storybook**: stabilized flaky Chromatic visual snapshots.
- **Storyblok UI**: addressed CodeRabbit review findings.

### Tooling

- **CI**: reuse build artifacts in the E2E job instead of rebuilding, using a tar archive to preserve exact paths; fixed tar argument order, artifact action versions (v7), YAML syntax in the extract step, and added verification.
- **Tests**: added unit tests for the storyblok-sync codegen type mapping.
- **Codebase**: aligned with `CLAUDE.md` conventions and removed unused code, dead exports, and verbose comments.

### Dependencies

- `pnpm` updated to v10.34.1.
- `oxfmt` updated to `^0.52.0`.
- `chromaui/action` digest updated to `8ad69a4`.
- `actions/upload-artifact` and `actions/download-artifact` pinned to v7 (digests `043fb46` / `37930b1`).

## [1.3.0] - 2026-05-27

### Added

- **Observability**: web vitals ingestion route (`/api/web-vitals`) with Sentry forwarding for real-user Core Web Vitals monitoring.
- **Observability**: replaced deprecated FID with INP in Google Analytics web vitals tracking.
- **Storybook**: visual regression testing via `@storybook/test-runner` with a dedicated CI job, later replaced `jest-image-snapshot` with Chromatic for cloud-hosted visual diffing.

### Fixed

- **Observability**: enforce body-size limit on actual bytes, cap pathname at the route level, and guard against empty release strings in Sentry reporting.
- **Observability**: hardened Sentry init with missing config guards and added turbo env passthrough for build-time variables.
- **Storybook**: scoped font overrides so they no longer leak outside stories, and emit Typography size CSS utilities.
- **Storyblok richtext**: `maxWidth` prop is now honored instead of silently ignored.

### Tooling

- **CI**: parallelised jobs, scoped secrets per job, pinned GitHub Actions versions, and added smart visual-test skip logic.
- **Storybook**: regrouped stories by function and switched dev to HTTPS (`dev:https`).
- **Tests**: added observability coverage for edge runtime, config resolution, and the web-vitals-reporter module.
- **Docs**: aligned Node version note in `CLAUDE.md` with `.nvmrc` and root `package.json`.

### Dependencies

- `chromaui/action` updated to v17.
- `chromaui/action` digest updated to `1cfa065`.
- `actions/setup-node` digest updated to `48b55a0`.

## [1.2.0] - 2026-05-22

### Added

- **Header**: 16x16 pixelated favicons next to external links in the pages column and in recent personal/client work columns, driven by `externalUrl` and flex-aligned centered.
- **Mobile menu**: animated ASCII tessellation backdrop replaces the previous blur effect.

### Changed

- **Mobile menu**: extracted into subcomponents, brutalist panel border, then dropped the panel border in favor of a flush-right thin divider with boosted pattern visibility.
- **Footer**: reordered sections — copyright now sits above the stars divider with an inline metadata line.
- **Header**: navigation style consts renamed to `SCREAMING_SNAKE_CASE`, pages-column nav items restored to inline text flow, favicons placed after the year in recent work columns.
- **Workcard**: title now uses the headline font.
- **Preview badge**: bottom offset bumped from `4` → `12`.

### Fixed

- **Mobile menu**: Safari 26 chrome tinting mitigation with inline button, 10% transparent backdrop tint with stable scrollbar gutter, unified panel top padding so the close button no longer overlaps content on tablet, auto-close when viewport crosses the `lg` breakpoint, prevent right-edge clip and flicker on toggle, drop `backdrop-filter` on close to restore `100dvh` page heights, body lock via `position: fixed` to preserve scroll position on Safari (later reverted in favor of `overflow: hidden`).
- **Header**: mobile menu button portaled to body so it sits above the preview badge and the open menu, first nav column kept at fixed width on desktop, expanded work columns collapse on route change.
- **Mobile header**: small header stays visible above the open mobile menu.
- **Image preview**: sticky preview now clears on route change.
- **Viewport**: switched page containers to `100dvh` / `100lvh` so Safari toolbars no longer clip content.
- **Footer**: wrapped link `rowGap` now aligns with copyright spacing on mobile.

### Tooling

- **Tests**: covered portfolio `lib` helpers and queries, added regression coverage for the image-preview route-change reset, and relaxed the preview-badge centering tolerance from 6px to 10px.

## [1.1.0] - 2026-05-21

### Added

- **Header**: collapsible work lists with a "less" toggle and a music link surfaced in the intro block.
- **Header**: mobile menu redesigned to mirror the desktop layout.

### Changed

- **UI**: `FloatingPreviewBadge` redesigned as a kawaii frosted-glass pill with unit and E2E coverage.
- **Header**: expanded work-list items float above content instead of pushing the layout, "less" toggle moved to the end of the expanded list, dropdown background dropped, recent-work cap removed.
- **now-playing**: widget hidden on mobile viewports.
- **revalidate**: narration comments stripped from the route handler.
- **tokens**: preview z-index split into `previewBadge` and `previewImage`.

### Fixed

- **Header**: mobile menu now auto-closes on route change.
- **Header**: mobile drawer font size unified at the `sm` breakpoint so tablet sizing matches.
- **Header**: mobile menu button no longer covers the intro block.
- **Header**: music link moved to the end of the intro block to stop layout overlap.
- **Headline / Paragraph**: support justified alignment by dropping `text-wrap: balance` and applying `text-justify: inter-word` on the `justify` variant; `SbHeadline` and `SbParagraph` now route the `CMS_OPTIONS.textAlign` justify option through the recipe (#13).
- **tokens**: preview z-index dropped below mobile menu so the preview badge and notification bar get covered when the menu is open.
- **revalidate**: accept the flat Storyblok webhook payload shape.

### Tooling

- Pinned Node 24 to work around `node:sqlite` errors on Node 23, then aligned the engines field, `.nvmrc`, and CI to read the version from `.nvmrc`.
- Downgraded to pnpm v10 and Node 22.5 for tooling compatibility, then bumped Node to 22.22.3 to satisfy oxlint's engines field; dropped `engines.pnpm` in favour of `packageManager` as the single source of truth.
- Removed automated release tooling (replaced release-please with changesets, then dropped changesets too) in favour of a manual release flow.
- Aligned the repo with the conventions documented in `CLAUDE.md`.

## [1.0.0] - 2026-05-19

First production-ready release.

### Highlights

- **Stack**: Next.js 16 App Router, React 19, TypeScript strict, ESM-only.
- **CMS**: Storyblok-driven content with Visual Editor live-bridge, draft mode, and tag-based cache invalidation via `@httpjpg/storyblok-next`.
- **Styling**: Panda CSS zero-runtime engine consuming `@httpjpg/tokens` design tokens, with semantic light/dark theme switching.
- **Monorepo**: pnpm workspaces + Turbo, 14 internal packages with strict dependency direction (tokens/env → utils → api/next/richtext → ui → storyblok-ui → app).
- **Observability**: Sentry wired through `@httpjpg/observability` for client, server, and edge runtimes.
- **Quality gates**: oxlint + oxfmt, Vitest unit tests, Playwright E2E, commitlint + husky pre-commit hooks, strict TypeScript across all packages.

[1.5.0]: https://github.com/dmnktoe/httpjpg/releases/tag/v1.5.0
[1.4.0]: https://github.com/dmnktoe/httpjpg/releases/tag/v1.4.0
[1.3.0]: https://github.com/dmnktoe/httpjpg/releases/tag/v1.3.0
[1.2.0]: https://github.com/dmnktoe/httpjpg/releases/tag/v1.2.0
[1.1.0]: https://github.com/dmnktoe/httpjpg/releases/tag/v1.1.0
[1.0.0]: https://github.com/dmnktoe/httpjpg/releases/tag/v1.0.0
