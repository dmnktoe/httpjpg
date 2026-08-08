# Releasing

Releases are automated with [release-please](https://github.com/googleapis/release-please). There is one version for the whole repo — the `version` field in the root `package.json` — because nothing here is published to npm; every workspace package stays `private` at `0.0.0`.

## The loop

1. You merge a conventional commit into `main`.
2. `.github/workflows/release.yml` runs release-please, which opens (or updates) a single PR titled `chore(release): <version>`. It bumps the root `package.json` and prepends a `CHANGELOG.md` section derived from the commits since the last tag.
3. **You curate that PR.** The generated notes are commit subjects; this changelog is written in prose. Edit `CHANGELOG.md` in the PR branch until it reads like the sections above it.
4. You merge the release PR. release-please tags `v<version>`, publishes the GitHub Release from the changelog section, and the `sentry-release` job builds the tag and uploads sourcemaps under that version.

Nothing is released until you merge that PR. It is safe to leave it open.

## Curate late, merge promptly

release-please regenerates the changelog in the release PR whenever a new commit lands on `main`, which **discards manual edits**. So do the prose pass when you actually intend to ship, not days ahead.

`### Removed` has no commit type behind it — add it by hand when a release drops something.

One cosmetic drift to expect: release-please writes its heading as `## [2.4.0](…compare/v2.3.0...v2.4.0) (2026-08-08)` with the diff link inline, where the hand-written history used `## [2.3.0] - 2026-08-08` plus a link-reference at the bottom of the file. The old entries are left untouched; the bottom link-references were already only maintained up to `1.5.0`.

## Commit types → changelog sections

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

Two consequences worth knowing:

- **Every** conventional commit bumps at least the patch version — `hidden: true` only keeps `chore` out of the changelog, it does not stop the bump. So a Renovate-only week still produces an open release PR at `x.y.z+1`. That is the intended behaviour: you decide whether that is worth shipping.
- Renovate commits with `deps:` (`.github/renovate.json` → `:semanticCommitTypeAll(deps)`), so dependency updates land under **Dependencies** instead of vanishing into a hidden `chore` section. `deps` is registered in `commitlint.config.ts`.

## Forcing a version

Put `Release-As: 3.0.0` in a commit body (an empty commit works) to override the computed version on the next run.

## CI on the release PR

`.github/workflows/ci.yml` has a `guard` job that skips the pipeline for branches matching `release-please--*`. The release PR only touches `package.json` and `CHANGELOG.md`, and every commit it describes already passed CI on `main`.

The jobs are skipped individually rather than the workflow being filtered out with `paths-ignore` or `[skip ci]`: a required status check that is never created leaves the PR blocked forever, while a skipped one counts as passed.

## Secrets

| Secret                                             | Needed for                                                       |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| `RELEASE_PLEASE_TOKEN`                             | Optional. A PAT with `contents: write` + `pull-requests: write`. Gives the release PR a real author and lets it trigger other workflows. Falls back to `GITHUB_TOKEN`. |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | The `sentry-release` job. Missing ones downgrade it to a warning instead of failing the release. |

Commit association (`sentry-cli releases set-commits --auto`) needs Sentry's GitHub integration connected to this repo. It is `continue-on-error` — the release and its sourcemaps land either way.

## Versions at runtime

`resolveAppVersion()` in `apps/portfolio/next.config.ts` resolves `NEXT_PUBLIC_APP_VERSION` in this order: the env var, `git describe --tags`, the latest GitHub Release, then a commit SHA. The deploy build sets no env var, so it resolves to the tag — which is exactly the release name the `sentry-release` job uploads sourcemaps under, so production stack traces symbolicate.

CI's `main` builds keep using `github.sha` as the release name, so main-branch errors still resolve against a commit.

## Bootstrapping

`.release-please-manifest.json` pins the current version (`2.3.0`) and `release-please-config.json` carries `bootstrap-sha` pointing at the `chore(release): 2.3.0` commit, so the first run only considers commits after it. Neither existing tags nor the existing changelog are rewritten.
