# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.2](https://github.com/dmnktoe/httpjpg/compare/v2.4.1...v2.4.2) (2026-08-09)


### Fixed

* **ui:** keep the mouse trail visible on dark pages ([#214](https://github.com/dmnktoe/httpjpg/issues/214)) ([8b41ad6](https://github.com/dmnktoe/httpjpg/commit/8b41ad646c2f9d9983cb8b1b5f1de18e632b7370))
* **weather:** keep the clock pinned to the site's home timezone ([#212](https://github.com/dmnktoe/httpjpg/issues/212)) ([a8b7324](https://github.com/dmnktoe/httpjpg/commit/a8b7324839ec9532a7d02ddcbc644b1d63669145))


### Tooling

* add a pull request template ([#215](https://github.com/dmnktoe/httpjpg/issues/215)) ([13d0a9e](https://github.com/dmnktoe/httpjpg/commit/13d0a9e866ea6f006dc39d24ac2730040ddd3ebc))

## [2.4.1](https://github.com/dmnktoe/httpjpg/compare/v2.4.0...v2.4.1) (2026-08-08)


### Fixed

* **draft:** stop paging Sentry for rejected preview secrets ([#209](https://github.com/dmnktoe/httpjpg/issues/209)) ([dae2f2f](https://github.com/dmnktoe/httpjpg/commit/dae2f2f76b24cdb741830807773760f1233e3b02))
* **weather:** show night emojis after dark ([#211](https://github.com/dmnktoe/httpjpg/issues/211)) ([3440f7f](https://github.com/dmnktoe/httpjpg/commit/3440f7fe04ca09c7497cd5cc157dfee7cd88e4fe))

## [2.4.0](https://github.com/dmnktoe/httpjpg/compare/v2.3.2...v2.4.0) (2026-08-08)


### Added

* **terminal:** unify dev CLI output across the repo ([#207](https://github.com/dmnktoe/httpjpg/issues/207)) ([0ae5f88](https://github.com/dmnktoe/httpjpg/commit/0ae5f883c1f5f1b44904835bdb22b503a538fbf7))


### Fixed

* **psn:** surface rejected credentials, and add CLIs to renew them ([#206](https://github.com/dmnktoe/httpjpg/issues/206)) ([51adb5a](https://github.com/dmnktoe/httpjpg/commit/51adb5a870d8f8c9c1cecd63bcfb8ae64ca8784f))


### Tooling

* raise coverage thresholds to 85% and cover four e2e contracts ([#208](https://github.com/dmnktoe/httpjpg/issues/208)) ([baa07ab](https://github.com/dmnktoe/httpjpg/commit/baa07abe0445e698852d5cd74c23453a52fa8e4b))


### Dependencies

* update actions/create-github-app-token action to v3 ([#202](https://github.com/dmnktoe/httpjpg/issues/202)) ([5327f1d](https://github.com/dmnktoe/httpjpg/commit/5327f1d4921cce4b26f603a3470ee76a53ea1bf0))

## [2.3.2](https://github.com/dmnktoe/httpjpg/compare/v2.3.1...v2.3.2) (2026-08-08)

### Fixed

- let release-please tag merged release PRs ([#203](https://github.com/dmnktoe/httpjpg/issues/203)) ([a6b2ecd](https://github.com/dmnktoe/httpjpg/commit/a6b2ecd0944b7a696752bf1d907078e4268664b9))

## [2.3.1](https://github.com/dmnktoe/httpjpg/compare/v2.3.0...v2.3.1) (2026-08-08)

### Fixed

- **ui:** keep authored year for Storyblok wall-clock datetimes ([#197](https://github.com/dmnktoe/httpjpg/issues/197)) ([b73e966](https://github.com/dmnktoe/httpjpg/commit/b73e9666cf49dc250a41361313af3bbc2a6f37bb))

### Tooling

- automate release management with release-please ([#195](https://github.com/dmnktoe/httpjpg/issues/195)) ([14bd2ae](https://github.com/dmnktoe/httpjpg/commit/14bd2ae1b6a099e60259da9da9f450ca6b299aed))
- fix the release PR title, header and author identity ([#201](https://github.com/dmnktoe/httpjpg/issues/201)) ([3803c79](https://github.com/dmnktoe/httpjpg/commit/3803c7919fa5ac369ec8a8f7b15947a7340b7a3f))

### Dependencies

- **deps:** update dependency oxfmt to ^0.62.0 ([#191](https://github.com/dmnktoe/httpjpg/issues/191)) ([3a2c64b](https://github.com/dmnktoe/httpjpg/commit/3a2c64bc87ed5bba2664f60458973cad3d08421e))

## [2.3.0] - 2026-08-08

### Added

- **UI / Storyblok-ui**: a badge primitive and a matching CMS blok. `Badge` renders a single external badge image (a shields.io SVG, say) at its natural size with a configurable height and an optional link; `BadgeGroup` lays badges out in a wrapping row; `Badges` takes an `items` array and renders the whole row in one call. The `badges` blok (holding `badge_item` children) exposes vertical alignment, row alignment and badge height on top of the standard spacing tab, and is allowed inside `section`. Documented in Storybook under `Display/Badges`.
- **UI**: a brutalist text-selection marker — selected text now carries the site's own highlight treatment instead of the browser default.

### Fixed

- **Storyblok-richtext**: images inside a richtext field no longer break hydration. A richtext image can be nested in a paragraph, and the old renderer wrapped it in a block `<div>` — invalid inside the resulting `<p>`, which the browser reparents, producing a React #418 hydration error. Images render as phrasing-content `<img>` now, and keep their natural aspect ratio instead of being forced into a 16:9 crop.

- **Storyblok-utils**: `getProcessedImage` no longer leaks the crop mode into the focal filter — a crop like `1200x630/smart` produced an invalid `focal(…:1200x630/smart)` coordinate for any story with a focal point set, silently degrading Open Graph and RSS images. Regression test added.
- **Portfolio**: the branded ASCII 404 screen actually renders now. It lived at the `(portfolio)` group boundary, where the `[...slug]` catch-all's own plain `not-found` boundary always shadowed it; the branded screen moved into the catch-all boundary and the shadowed file is gone.
- **Storyblok-sync**: component and group lookups fail loudly instead of swallowing errors — a transient Management API failure used to make `upsertBlock` re-create (duplicate) every existing component, and `sync-component-groups` had the same duplicate-creating swallow. Group UUIDs are fetched once per run instead of once per group name, `sync-components` exits non-zero when any block fails instead of reporting success, and malformed list responses are rejected instead of being treated as empty (which also created duplicates).
- **UI**: `formatYear` guards invalid dates (no more `"NaN"`) and uses UTC so date-only strings can't shift a year across timezones; the drifted duplicate in `og-work-meta` now delegates to the shared helper. External projects show the external-link icon in both the desktop nav and the mobile menu, matching the websites column, and the desktop header's `www.httpjpg.com` text is now an actual home link (previously the only `/` link in the header was mobile-only).
- **Portfolio**: the dev-mode fallback for unknown bloks works again — `@storyblok/react` v7 ignores a `_fallback` registry key, so `SbMissing` is now wired via `enableFallbackComponent`/`customFallbackComponent`.
- **Spotify / Now-playing**: `useNowPlaying` ignores in-flight responses after unmount or an endpoint change, and `NowPlaying` cancels color extraction and its settle timeout on cleanup — no more stale state or setState-after-unmount warnings.
- **Portfolio**: the Discord API route returns a distinct 503 when the Storyblok config story cannot be loaded, instead of blaming the CMS content for a fetch failure.
- **Observability**: server and edge Sentry init guard like the client — skipped without a DSN, when disabled, or when a client is already initialized.

### Changed

- **CMS**: image widths use an even 10%-step scale (`10%` … `100%`) instead of the previous hand-picked `5/25/33/50/65/75/100`. The old scale mixed quarters, thirds and one-off values, so the editor offered uneven jumps. Values outside the new scale are dropped rather than aliased: any story still holding `5%`, `25%`, `33%`, `65%` or `75%` loses that width and falls back to the layout default, so re-check those images after syncing.
- **Storyblok-ui**: `SbImage` and `SbScrollClipImage` render their caption only when the richtext document has content, matching `SbVideo`.
- **UI**: the work-card description clamp uses Panda's `lineClamp` utility instead of a hand-rolled `-webkit-box` style that needed an `as any` cast.

### Removed

- **Portfolio**: the guessed fallback navigation (`Home`/`CV`/`Feed`, with a `/feed-xml_html` link that 404ed and a `/cv` link that only resolved if such a story happened to exist). The header menu now mirrors the Storyblok config exactly — when the config story is unpublished or the menu is empty, no menu links render and the header's built-in home link keeps the site navigable.
- Dead code across the workspace, each confirmed unused by a repo-wide reference audit: the orphaned `@httpjpg/ui` `styles/global` module and subpath, `getAllSlugs` (storyblok-api), `hasMediaConsent` plus the `OPEN_COOKIE_SETTINGS_EVENT` re-export and `./banner` subpath (consent), the `./google`/`./umami` subpath barrels (analytics), the root and `./sentry` barrels (observability), the unregistered `SbCaption` re-export and `FooterConfig` alias (storyblok-ui), `OverlayPatternName`, the phantom `ImagePreview` `height` prop and `useNowPlaying`'s `refetch` (ui/spotify), unused Storybook option arrays, fixtures and the `addon-links` addon, unused Studio option constants, the dead Spotify OAuth callback route, the unused `config.ui` theme block, and the legacy `text` blok registry alias.
- **Env**: `DISCORD_USER_ID` (the Storyblok config story is the source of truth) and the CI-only `SENTRY_AUTH_TOKEN`/`SENTRY_ORG`/`SENTRY_PROJECT` dropped from the runtime env contract, `turbo.json`, and `.env.example`.
- **Music player**: the no-op `custom` source removed from the UI type, the CMS schema, and Storybook — it rendered nothing; run `sync:components` to update the space.

### Performance

- **Spotify**: the API access token is cached per credential set until shortly before `expires_in` (with in-flight request dedupe), cutting the ~10s now-playing poll from two Spotify requests to one; failures are never cached, and a 401 on a cached token drops the cache and retries once with a fresh token so a revoked token can't pin the widget to errors.

### Tooling

- **CI**: `apps/studio` joins the `build-apps` matrix — it was typechecked and linted but never built, so `next build` regressions shipped uncaught.
- **Docs**: `apps/studio` documented in the CLAUDE.md architecture overview.

### Dependencies

- **Runtime**: `framer-motion` replaced by its successor package `motion`; Swiper migrated to v14; `sharp` to ^0.35.
- **Build & styling**: Panda CSS to v1.12, `oxfmt` to ^0.61, Node.js to 22.23.2, pnpm to 10.34.5.
- **Testing**: jsdom to v30 and `@testing-library/jest-dom` to v7. Note that jsdom 30 resolves `em` to `px` in `getComputedStyle`, so assertions comparing a declared `em` value against `toHaveStyle` need to read the inline style instead.
- **CI actions**: `actions/checkout` v7, `actions/setup-node` v7, `actions/cache` v6, `codecov/codecov-action` v7, `chromaui/action` v18 and `chromatic` v18; Renovate no longer opens standalone digest-bump PRs for GitHub Actions.
- Lockfile maintenance and type-definition refreshes across the workspace.

## [2.2.0] - 2026-07-03

### Added

- **Widgets**: a PlayStation "latest trophy" footer widget — surfaces the most recently earned trophy (tier sprite, game, platform) from Sony's first-party trophy API (`psn-api`, authenticated with an `PSN_NPSSO` token exchanged for cached short-lived auth tokens). Gated behind a `psn_trophy_enabled` Storyblok config flag, and the Discord and Letterboxd footer widgets are now flag-gated too.
- **Security**: baseline security headers on every document response in the edge proxy — `Strict-Transport-Security`, `Referrer-Policy`, `X-Content-Type-Options`, and `Permissions-Policy` — alongside the existing CSP `frame-ancestors` directive. `X-Frame-Options` is intentionally omitted so CSP remains the single source of framing policy and keeps the Storyblok Visual Editor able to embed the site.
- **Now-playing**: the widget now surfaces Spotify Premium-missing and error states — a typed `SpotifyForbiddenError` on 403, an `errorCode` exposed by `useNowPlaying`, and a red "danger" 403/500 artwork state — with matching Storybook stories.
- **UI**: `Video` gains an `objectFit` prop and the Slideshow/Video loading path is hardened — the skeleton resolves on `canplay`/`error` (not just `loadeddata`) so a slow or failed source falls back to the poster, muted autoplay is set imperatively, and `prefers-reduced-motion` is respected (no video or carousel autoplay, paused shimmer). First `Video` tests added.

### Changed

- **Storyblok-richtext**: migrated rich-text rendering to `@storyblok/react` v7 / `@storyblok/richtext` v5. The `richTextResolver<ReactNode>` + tag-keyed `tagRenderers` map is replaced by `createRichTextRenderer` and a node/mark-keyed `components` map, the custom Tiptap image/inline-code extensions are dropped (v5 carries `copyright` natively and treats inline code as a distinct `code` mark), and the v5 `emoji` node is handled inline. The public API (`StoryblokRichText`, `renderStoryblokRichText`, `StoryblokRichTextProps`) is unchanged.
- **Letterboxd**: films are ordered by watched date (newest first) instead of raw feed order, HTML entities in titles are decoded (e.g. `Johnny & Me`), and member likes surface a heart in the widget.

### Fixed

- **Portfolio**: added a root `not-found.tsx` boundary so the home route renders the branded 404 (instead of Next.js's default) when the home story is unpublished or fails to load, and as a global fallback for any unmatched URL routed through the root layout.
- **Widgets**: each footer widget now triggers a single hover preview at one size (1:1 for Discord, 2:3 for Letterboxd) instead of two conflicting previews from the thumbnail and the name.
- **Observability**: the Sentry release now resolves from the build-time `NEXT_PUBLIC_APP_VERSION` (git tag / GitHub release / commit SHA) instead of the unmaintained `npm_package_version` `0.0.0` placeholder, so releases report meaningfully.
- **Spotify**: a 403 (e.g. no Premium) is treated as "nothing playing" rather than throwing, and forbidden playback is no longer logged on every poll.

### Performance

- **API**: CDN cache headers (`public`, `s-maxage` + `stale-while-revalidate`) added to the Discord (30s window) and Letterboxd (5min window) routes, mirroring the Spotify now-playing pattern, so repeat hits are served from the CDN edge instead of always reaching the origin. Error and unconfigured responses stay uncached.

### Tooling

- **Tests**: Vitest coverage thresholds (statements/lines 80%, functions 75%, branches 70%) with html/lcov reporters, plus IntersectionObserver / ResizeObserver / matchMedia stubs in the global setup so UI components mount cleanly under jsdom. New tests fill the lowest-covered areas — every `Sb*` blok and helper in storyblok-ui, storyblok-utils (media/plain-text/presets/preview/responsive), now-playing, spotify color extraction, and ui card/filter/spotify-id.
- **CI**: Codecov bundle analysis wired via Next 16's Turbopack-native `experimental-analyze` and `@codecov/nextjs-webpack-plugin`, with a non-gating CI job uploading the report per PR.
- **CI**: Codecov config tuned for the monorepo — per-package component breakdown (ui, storyblok, integrations, foundations, portfolio), a softened informational patch target, and a components-based comment layout.
- **Chore**: sorted the root config files.

### Dependencies

- `@storyblok/react` `6` → `7` (pulls richtext v5 + `@storyblok/js` 6).
- Node.js updated to `22.23.1`.
- `pnpm` updated to `10.34.4`.
- Panda CSS updated to `1.11.3`.
- `sharp` updated to `^0.35.0`.
- linting & formatting (oxlint + oxfmt) updated — oxfmt `^0.57.0`, group `^0.55.0`.
- type definitions, `codecov/codecov-action` v7, `actions/checkout` v7, `pnpm/action-setup` and `chromaui/action` digests updated, plus lock file maintenance.

## [2.1.1] - 2026-06-04

### Added

- **Portfolio**: Arcjet rate-limiting on the public API routes, throttling abusive traffic to the discord, spotify, and other handlers.
- **Portfolio**: a Letterboxd recently-watched widget surfacing the latest films logged on Letterboxd.
- **Storyblok-sync**: editor previews and field tooltips pushed to the CMS, giving editors inline guidance and live block previews in the Visual Editor.

### Fixed

- **Observability**: web vitals are now reported via browser tracing instead of the errors quota, keeping performance data off the error budget.
- **A11y**: accessible labels added to form controls and canvas interactions.
- **UI**: focus is trapped inside the mobile menu dialog while it is open.
- **UI**: cursor, mouse trail, and marquee now respect `prefers-reduced-motion`.
- **Portfolio**: the CMS-sourced discord user id is validated before the external Lanyard call.
- **UI**: `ImagePreview` no longer hardcodes a 16:9 aspect ratio — it reads the existing `data-preview-ratio` attribute (falling back to 16:9) and an optional `data-preview-width` override, so the Letterboxd poster preview (2:3, sized to 70px → 105px tall) is no longer stretched or oversized.

### Performance

- **Storyblok-sync**: reduced request load during sync to stay under the Storyblok Management API rate limit.

### Tooling

- **CodeRabbit**: a lean CodeRabbit review config.
- **Tests**: coverage for the storyblok api, next cache, and richtext layers, plus the previously-untested portfolio `components/ui` layout components (console-banner, custom-cursor-wrapper, nostalgia-slideshow, preview-notification, scroll-to-top, theme-sync, work-nav) and the `LetterboxdStatus` widget.
- **CI**: JUnit test results uploaded to Codecov Test Analytics (via a dedicated `test:ci` script so the reporter flags reach vitest) for run times, failure rates, and flaky-test detection.
- **CI**: the merge gate is now self-maintaining — a single `contains(needs.*.result, …)` guard covers every dependency automatically, and the aggregate job was renamed to "All checks passed".

### Dependencies

- lock file maintenance.

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
