# GitHub CI/CD Configuration

This directory contains the CI/CD workflows and GitHub configuration for the httpjpg monorepo.

## 📋 Workflows

### [`ci.yml`](./workflows/ci.yml)
Main CI pipeline that runs on every push and pull request:
- 🔬 **Lint**: Biome linting check
- ʦ **TypeCheck**: TypeScript type checking across all packages
- 📦 **Build Packages**: Builds all packages in `packages/*`
- 📦 **Build Apps**: Builds web and storybook apps
- 🃏 **Jest Tests**: Unit tests with coverage (when enabled)
- 🎭 **Playwright E2E**: End-to-end tests (when enabled)

### [`codeql.yml`](./workflows/codeql.yml)
Security scanning with GitHub CodeQL:
- Runs on push to main, PRs, and weekly schedule
- Scans for security vulnerabilities and code quality issues

### [`dependency-review.yml`](./workflows/dependency-review.yml)
Reviews dependencies in pull requests:
- Checks for vulnerable dependencies
- Validates licenses (denies GPL-2.0, GPL-3.0)
- Comments summary in PR

## 🤖 Automation

### [`dependabot.yml`](./dependabot.yml)
Automated dependency updates:
- Weekly updates on Mondays
- Grouped updates for related packages (Biome, Storyblok, Next.js, React)
- Separate updates for GitHub Actions

## 📝 Templates

### [`PULL_REQUEST_TEMPLATE.md`](./PULL_REQUEST_TEMPLATE.md)
Standard PR template with:
- Description and related issue
- Type of change checkboxes
- Testing checklist
- Affected packages/apps

### Issue Templates
- **[Bug Report](./ISSUE_TEMPLATE/bug_report.yml)**: Structured bug report form
- **[Feature Request](./ISSUE_TEMPLATE/feature_request.yml)**: Feature request form
- **[Config](./ISSUE_TEMPLATE/config.yml)**: Issue template configuration

## 🔑 Required Secrets

Add these secrets in **Settings → Secrets and variables → Actions**:

### Required for Builds
- `NEXT_PUBLIC_STORYBLOK_TOKEN` - Public Storyblok token for CDN access
- `STORYBLOK_PREVIEW_TOKEN` - Storyblok preview token for draft mode
- `STORYBLOK_PREVIEW_SECRET` - Secret for draft API route
- `STORYBLOK_REVALIDATE_SECRET` - Secret for revalidation webhook

### Optional (for CI optimization)

- `TURBO_TOKEN` - Vercel Remote Caching token (speeds up CI)
- `TURBO_TEAM` - Vercel team name for Remote Caching
- `SENTRY_DSN` - Sentry error tracking
- `SENTRY_ORG` - Sentry organization
- `SENTRY_PROJECT` - Sentry project name
- `CODECOV_TOKEN` - Codecov token for coverage reports

### Runtime-only (not needed for CI)

These secrets are **only required in your production environment** (Vercel), not in GitHub Actions:

- `SPOTIFY_CLIENT_ID` - Spotify API credentials (used by `/api/spotify/now-playing` at runtime)
- `SPOTIFY_CLIENT_SECRET` - Spotify API credentials
- `SPOTIFY_REFRESH_TOKEN` - Your personal Spotify refresh token (cannot be used in CI)

## 🚀 CI Optimization

### Turborepo Remote Caching
To enable faster CI builds with Turborepo Remote Caching:

1. Sign up at [Vercel](https://vercel.com)
2. Get your token: `npx turbo login`
3. Link your repository: `npx turbo link`
4. Add `TURBO_TOKEN` and `TURBO_TEAM` secrets

### Build Parallelization
The CI is optimized with:
- Parallel jobs for lint, typecheck, and builds
- Separate package and app builds
- Artifact caching between jobs
- Concurrency groups to cancel outdated runs

## 📊 Status Badges

Add these to your main README.md:

```markdown
[![CI](https://github.com/dmnktoe/httpjpg/actions/workflows/ci.yml/badge.svg)](https://github.com/dmnktoe/httpjpg/actions/workflows/ci.yml)
[![CodeQL](https://github.com/dmnktoe/httpjpg/actions/workflows/codeql.yml/badge.svg)](https://github.com/dmnktoe/httpjpg/actions/workflows/codeql.yml)
```

## 🔧 Local Development

The CI workflows are designed to match your local development environment:

```bash
# What CI runs:
pnpm run lint              # Biome lint
pnpm run type-check        # TypeScript check
pnpm run build             # Build all packages and apps
pnpm run test              # Jest tests (when enabled)
pnpm run test:e2e          # Playwright E2E (when enabled)
```

## 📚 Environment Variables

The CI uses `SKIP_ENV_VALIDATION=true` to skip strict env validation during builds.

See [`packages/env/src/env.mjs`](../packages/env/src/env.mjs) for all available environment variables.

## 🐛 Troubleshooting

### Build Fails with "Missing Environment Variable"
Add the required secret in GitHub Settings → Secrets and variables → Actions

### "Context access might be invalid" Warnings
These are normal if the secret hasn't been added yet. Add the secret or set `SKIP_ENV_VALIDATION=true`

### Turborepo Cache Misses
Ensure `TURBO_TOKEN` and `TURBO_TEAM` are set correctly

### Playwright Tests Fail
Check if `test:e2e` script exists in `apps/web/package.json` or disable the job by setting `if: false`
