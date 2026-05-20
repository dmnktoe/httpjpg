# Changesets

This folder holds pending release notes. Each `*.md` file describes a change
that's been merged into `main` but not yet released.

## Adding a changeset

When your change is user-visible (feature, fix, perf, refactor, docs that
matters), run:

```bash
pnpm changeset
```

Pick the bump level (`patch` / `minor` / `major`) and write a short summary in
Conventional-Commits style:

```
feat: add RSS feed for /work
fix: prevent draft mode leak when cookie is stale
perf: defer Storyblok bridge load until first interaction
```

The first word (`feat`, `fix`, `perf`, `refactor`, `docs`, `build`, `ci`)
controls which section the entry lands in inside the root `CHANGELOG.md`;
anything else falls under "Other Changes".

## What happens next

1. Commit the generated `.changeset/*.md` file with your PR.
2. When `main` advances, the **Release** workflow opens (or updates) a
   `chore: release` PR that bumps every `@httpjpg/*` package in lockstep,
   syncs the root `package.json`, and prepends a section to `CHANGELOG.md`.
3. Merging that PR creates a single `vX.Y.Z` tag and one GitHub Release.

## Repo-wide conventions

- All packages are private and versioned together (`fixed` mode).
- Per-package `CHANGELOG.md` files are intentionally disabled — only the root
  changelog matters.
- Picking the bump level: `major` for breaking CMS schema or public route
  changes, `minor` for new features, `patch` for fixes and chores.

See [`RELEASING.md`](../RELEASING.md) for the full workflow.
