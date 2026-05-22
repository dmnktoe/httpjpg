# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-05-22

### Added

- **Header**: 16x16 pixelated favicons next to external links in the pages
  column and in recent personal/client work columns, driven by `externalUrl`
  and flex-aligned centered.
- **Mobile menu**: animated ASCII tessellation backdrop replaces the previous
  blur effect.

### Changed

- **Mobile menu**: extracted into subcomponents, brutalist panel border,
  then dropped the panel border in favor of a flush-right thin divider with
  boosted pattern visibility.
- **Footer**: reordered sections — copyright now sits above the stars
  divider with an inline metadata line.
- **Header**: navigation style consts renamed to `SCREAMING_SNAKE_CASE`,
  pages-column nav items restored to inline text flow, favicons placed
  after the year in recent work columns.
- **Workcard**: title now uses the headline font.
- **Preview badge**: bottom offset bumped from `4` → `12`.

### Fixed

- **Mobile menu**: Safari 26 chrome tinting mitigation with inline button,
  10% transparent backdrop tint with stable scrollbar gutter, unified panel
  top padding so the close button no longer overlaps content on tablet,
  auto-close when viewport crosses the `lg` breakpoint, prevent right-edge
  clip and flicker on toggle, drop `backdrop-filter` on close to restore
  `100dvh` page heights, body lock via `position: fixed` to preserve scroll
  position on Safari (later reverted in favor of `overflow: hidden`).
- **Header**: mobile menu button portaled to body so it sits above the
  preview badge and the open menu, first nav column kept at fixed width on
  desktop, expanded work columns collapse on route change.
- **Mobile header**: small header stays visible above the open mobile menu.
- **Image preview**: sticky preview now clears on route change.
- **Viewport**: switched page containers to `100dvh` / `100lvh` so Safari
  toolbars no longer clip content.
- **Footer**: wrapped link `rowGap` now aligns with copyright spacing on
  mobile.

### Tooling

- **Tests**: covered portfolio `lib` helpers and queries, added regression
  coverage for the image-preview route-change reset, and relaxed the
  preview-badge centering tolerance from 6px to 10px.

## [1.1.0] - 2026-05-21

### Added

- **Header**: collapsible work lists with a "less" toggle and a music link
  surfaced in the intro block.
- **Header**: mobile menu redesigned to mirror the desktop layout.

### Changed

- **UI**: `FloatingPreviewBadge` redesigned as a kawaii frosted-glass pill with
  unit and E2E coverage.
- **Header**: expanded work-list items float above content instead of pushing
  the layout, "less" toggle moved to the end of the expanded list, dropdown
  background dropped, recent-work cap removed.
- **now-playing**: widget hidden on mobile viewports.
- **revalidate**: narration comments stripped from the route handler.
- **tokens**: preview z-index split into `previewBadge` and `previewImage`.

### Fixed

- **Header**: mobile menu now auto-closes on route change.
- **Header**: mobile drawer font size unified at the `sm` breakpoint so tablet
  sizing matches.
- **Header**: mobile menu button no longer covers the intro block.
- **Header**: music link moved to the end of the intro block to stop layout
  overlap.
- **Headline / Paragraph**: support justified alignment by dropping
  `text-wrap: balance` and applying `text-justify: inter-word` on the
  `justify` variant; `SbHeadline` and `SbParagraph` now route the
  `CMS_OPTIONS.textAlign` justify option through the recipe (#13).
- **tokens**: preview z-index dropped below mobile menu so the preview badge
  and notification bar get covered when the menu is open.
- **revalidate**: accept the flat Storyblok webhook payload shape.

### Tooling

- Pinned Node 24 to work around `node:sqlite` errors on Node 23, then aligned
  the engines field, `.nvmrc`, and CI to read the version from `.nvmrc`.
- Downgraded to pnpm v10 and Node 22.5 for tooling compatibility, then bumped
  Node to 22.22.3 to satisfy oxlint's engines field; dropped `engines.pnpm` in
  favour of `packageManager` as the single source of truth.
- Removed automated release tooling (replaced release-please with changesets,
  then dropped changesets too) in favour of a manual release flow.
- Aligned the repo with the conventions documented in `CLAUDE.md`.

## [1.0.0] - 2026-05-19

First production-ready release.

### Highlights

- **Stack**: Next.js 16 App Router, React 19, TypeScript strict, ESM-only.
- **CMS**: Storyblok-driven content with Visual Editor live-bridge, draft mode,
  and tag-based cache invalidation via `@httpjpg/storyblok-next`.
- **Styling**: Panda CSS zero-runtime engine consuming `@httpjpg/tokens` design
  tokens, with semantic light/dark theme switching.
- **Monorepo**: pnpm workspaces + Turbo, 14 internal packages with strict
  dependency direction (tokens/env → utils → api/next/richtext → ui → storyblok-ui → app).
- **Observability**: Sentry wired through `@httpjpg/observability` for client,
  server, and edge runtimes.
- **Quality gates**: oxlint + oxfmt, Vitest unit tests, Playwright E2E,
  commitlint + husky pre-commit hooks, strict TypeScript across all packages.

[1.2.0]: https://github.com/dmnktoe/httpjpg/releases/tag/v1.2.0
[1.1.0]: https://github.com/dmnktoe/httpjpg/releases/tag/v1.1.0
[1.0.0]: https://github.com/dmnktoe/httpjpg/releases/tag/v1.0.0
