<!--
Title follows Conventional Commits — it becomes the squash commit and drives
the changelog section + version bump (see CLAUDE.md → Releases).
e.g. feat(ui): add marquee variant · fix(psn): handle expired credentials
-->

## What & why

<!-- One or two sentences: what changes, and what problem it solves. Link the issue if there is one. -->

Closes #

## Change type

<!-- Matches the commit type in the title. Tick exactly one. -->

- [ ] `feat` — new feature (minor bump, → Added)
- [ ] `fix` — bug fix (patch, → Fixed)
- [ ] `refactor` / `style` / `revert` (patch, → Changed)
- [ ] `perf` (patch, → Performance)
- [ ] `build` / `ci` / `docs` / `test` (patch, → Tooling)
- [ ] `deps` (patch, → Dependencies)
- [ ] `chore` (patch, hidden from the changelog)
- [ ] Contains a `BREAKING CHANGE:` footer (major)

## Scope

<!-- Which workspaces this touches, e.g. apps/portfolio, packages/ui, packages/storyblok-ui. -->

## Screenshots / recordings

<!-- Required for anything visual. Before ↔ after, light + dark if the change touches semantic tokens. -->

## Checklist

- [ ] `pnpm lint`, `pnpm type-check`, `pnpm test` and `pnpm build` pass locally
- [ ] Follows the conventions in `CLAUDE.md` — I read a neighbouring file before inventing a pattern
- [ ] Scoped: no drive-by refactors bundled with the feature
- [ ] Server Components by default; any new `"use client"` boundary is as small as possible
- [ ] Styling uses design tokens from `@httpjpg/tokens` via Panda (no raw hex outside genuinely off-palette decoration)
- [ ] Dependency direction respected (tokens/env stay leaves; `ui` never imports back from consumers)
- [ ] New env vars declared in `packages/env/src/env.mjs`, `.env.example` and `turbo.json`
- [ ] Tests added or updated next to the source (`*.test.ts(x)`); E2E updated if a user-facing flow changed
- [ ] No `console.log` in shipped paths; errors reported through `@httpjpg/observability`
- [ ] Did **not** hand-edit the root `package.json` version, `.release-please-manifest.json` or `CHANGELOG.md`

## Storyblok / CMS

<!-- Delete this section if the change does not touch the CMS contract. -->

- [ ] Schema added or updated in `packages/storyblok-sync/scripts/blocks/*`
- [ ] `sync:components` (and `sync:datasources` for new `CMS_OPTIONS`) run against Storyblok
- [ ] `Sb*` component added under `packages/storyblok-ui/src/components/<kebab>/` and exported explicitly from `src/index.ts`
- [ ] Registered in `apps/portfolio/lib/storyblok.ts` under its blok name
- [ ] `editableAttrs(blok)` spread on the root element, spacing handled via `BlokSpacing` / `spacingCss()`
- [ ] Cache tags / revalidation adjusted if the content shape changed

## Notes for reviewers

<!--
Anything worth flagging: a convention you matched but would change, a follow-up
you deliberately left out, a risky area to look at first.
-->
