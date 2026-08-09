# ⇝pull request

*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚

## what & why

<!-- One or two sentences. What changes, and what it fixes or unlocks. -->

Closes #

## scope

<!-- Which workspaces does this touch? e.g. `apps/portfolio`, `@httpjpg/ui`, `@httpjpg/storyblok-ui` -->

## change type

<!-- Pick one. It decides the changelog section and the version bump. -->

- [ ] `feat` — new feature · **Added** · minor
- [ ] `fix` — bug fix · **Fixed** · patch
- [ ] `refactor` / `style` / `revert` · **Changed** · patch
- [ ] `perf` — faster or leaner · **Performance** · patch
- [ ] `build` / `ci` / `docs` / `test` · **Tooling** · patch
- [ ] `deps` — dependency bump · **Dependencies** · patch
- [ ] `chore` — hidden from the changelog · patch
- [ ] carries a `BREAKING CHANGE:` footer · **⚠ BREAKING** · major

## screenshots / recordings

<!-- Before / after for anything visual. Drag files in here, or delete the section. -->

---

<details>
<summary><b>checklist</b> — every pull request</summary>

<br/>

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

</details>

<details>
<summary><b>storyblok / cms</b> — only if a blok or schema moved</summary>

<br/>

- [ ] Schema added or updated in `packages/storyblok-sync/scripts/blocks/*`
- [ ] `sync:components` (and `sync:datasources` for new `CMS_OPTIONS`) run against Storyblok
- [ ] `Sb*` component added under `packages/storyblok-ui/src/components/<kebab>/` and exported explicitly from `src/index.ts`
- [ ] Registered in `apps/portfolio/lib/storyblok.ts` under its blok name
- [ ] `editableAttrs(blok)` spread on the root element, spacing handled via `BlokSpacing` / `spacingCss()`
- [ ] Cache tags / revalidation adjusted if the content shape changed

</details>

---

## notes for reviewers

<!-- Anything unresolved, any trade-off you made on purpose, anything to look at first. -->
