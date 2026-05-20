# Releasing

This repo uses [Changesets](https://github.com/changesets/changesets) for
release automation, configured to match the previous `release-please` simple
mode: **one shared version, one git tag, one GitHub Release, one root
`CHANGELOG.md`**. All workspace packages bump in lockstep via the `fixed`
config.

## TL;DR

```bash
# while working on a PR
pnpm changeset            # record what changed
git add .changeset && git commit -m "chore: add changeset"

# merge your PR to main → the Release workflow opens a "chore: release" PR
# merge the release PR → the workflow tags vX.Y.Z and opens a GitHub Release
```

Nothing to run locally for the actual release — CI does it.

## Day-to-day flow

### 1. Add a changeset with your PR

Whenever a change is user-visible (feature, fix, perf, refactor, docs that
matters), run:

```bash
pnpm changeset
```

The interactive prompt asks for:

- **Packages affected** — pick any one (or all). Because of the `fixed`
  config, every `@httpjpg/*` package will bump together regardless of which
  you tick. Selecting just `@httpjpg/portfolio` is the most natural default.
- **Bump level** — `patch` / `minor` / `major`. The highest level across
  all pending changesets wins.
- **Summary** — a single line, Conventional-Commits style:

  ```
  feat: add RSS feed for /work
  fix: prevent draft mode leak when cookie is stale
  perf: defer Storyblok bridge load until first interaction
  ```

  The prefix decides the `CHANGELOG.md` section. Recognised types:
  `feat`, `fix`, `perf`, `refactor`, `docs`, `build`, `ci`. Anything
  else falls under "Other Changes".

That creates a file like `.changeset/quiet-pandas-spin.md`. Commit it as
part of your PR.

### 2. Skipping a changeset

Internal refactors, test-only changes, CI tweaks, dependency bumps without
runtime impact — no changeset needed. The release PR simply won't be opened
or updated by that merge.

If you want to enforce a changeset on PRs that touch app code, add the
[`changeset-bot`](https://github.com/apps/changeset-bot) GitHub App. It's
optional and not wired up by default.

### 3. Picking the bump level

| Level   | When                                                                          |
| ------- | ----------------------------------------------------------------------------- |
| `patch` | Bug fixes, internal cleanups that ship, docs, CI, dependency bumps that ship. |
| `minor` | New features, new CMS bloks, new env vars that are optional.                  |
| `major` | Breaking CMS schema changes, removed public routes, required new env vars.    |

When in doubt, go lower. We can always re-tag.

### 4. What CI does on `main`

The `.github/workflows/release.yml` workflow runs `changesets/action@v1`:

- **If there are pending changesets** → opens (or refreshes) a PR titled
  `chore: release`. That PR contains:
  - Every `@httpjpg/*` `package.json` bumped to the next version.
  - The root `package.json` synced to the same version.
  - A new section at the top of `CHANGELOG.md` listing every summary,
    grouped by type.
  - The consumed `.changeset/*.md` files removed.
- **If there are no pending changesets** (i.e. the release PR just merged)
  → runs `pnpm run release:publish`, which creates a `vX.Y.Z` git tag and
  one GitHub Release whose notes are the matching `CHANGELOG.md` section.

The publish step is idempotent: if the tag already exists, it exits 0.

## Local sanity checks

Run the version script against a fresh changeset before pushing if you want
to preview the diff:

```bash
pnpm changeset                # add a dummy changeset
pnpm release:version          # bumps versions + writes CHANGELOG entry
git diff                       # inspect
git restore .                  # revert when done
```

`release:publish` is CI-only — it expects `GITHUB_TOKEN` and a clean tree.

## How this differs from release-please

| Concern              | release-please (before)                    | Changesets (now)                                       |
| -------------------- | ------------------------------------------ | ------------------------------------------------------ |
| Trigger              | Conventional Commits scanned on every push | Explicit `.changeset/*.md` files committed with the PR |
| What can fail        | Commit parsing, search depth, sync drift   | Almost nothing — the changeset is right there in git   |
| Release PR           | Auto-opened, sometimes vanishes            | Auto-opened by `changesets/action`, never disappears   |
| Bump source of truth | Commit prefix (`feat:` / `fix:`)           | Manual choice in `pnpm changeset`                      |
| Per-package versions | Single root version, packages untouched    | All packages locked together via `fixed`               |
| Changelog            | One root `CHANGELOG.md`                    | Same — per-package changelogs are disabled             |
| Tag + Release        | One `vX.Y.Z`                               | Same — created by `scripts/release-publish.mjs`        |

The day-to-day cost is one extra `pnpm changeset` per user-visible PR. The
upside is that release behaviour is deterministic: if the file is in git,
the bump will happen.

## Files involved

```
.changeset/
  config.json                # changesets config (fixed, no per-pkg CHANGELOG)
  README.md                  # contributor pointer
  *.md                       # pending changesets, consumed by release:version
scripts/
  release-version.mjs        # custom `version` (lockstep + root CHANGELOG)
  release-publish.mjs        # custom `publish` (one tag + one GitHub Release)
.github/workflows/release.yml
CHANGELOG.md                 # single source of truth for release notes
```
