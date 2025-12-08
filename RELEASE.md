# Release Process

This project uses [release-please](https://github.com/googleapis/release-please) for automated release management.

## How It Works

Release-please automates the entire release process based on [Conventional Commits](https://www.conventionalcommits.org/):

1. **Commit Changes**: Push commits following conventional commit format to the `main` branch
2. **Release PR Created**: release-please automatically creates/updates a release PR with:
   - Version bumps based on commit types
   - Updated CHANGELOG.md files
   - Updated package.json versions
3. **Merge to Release**: When you merge the release PR, release-please:
   - Creates GitHub releases with release notes
   - Tags the releases

## Commit Format

Use conventional commit format for all commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- `feat:` - New feature (triggers minor version bump)
- `fix:` - Bug fix (triggers patch version bump)
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements (triggers patch version bump)
- `test:` - Adding or updating tests
- `build:` - Build system or external dependencies
- `ci:` - CI/CD changes
- `chore:` - Other changes (maintenance, etc)
- `revert:` - Revert previous commit

### Breaking Changes

To trigger a major version bump, add `BREAKING CHANGE:` in the commit footer or use `!` after the type:

```
feat!: remove deprecated API

BREAKING CHANGE: The old API has been removed. Use the new API instead.
```

## Examples

```bash
# Feature (minor bump: 1.0.0 -> 1.1.0)
git commit -m "feat: add new analytics tracking feature"

# Bug fix (patch bump: 1.0.0 -> 1.0.1)
git commit -m "fix: resolve memory leak in consent module"

# Breaking change (major bump: 1.0.0 -> 2.0.0)
git commit -m "feat!: redesign authentication API"

# With scope
git commit -m "fix(ui): correct button alignment in dark mode"
```

## Manual Release (If Needed)

In rare cases where you need to manually trigger a release:

1. Ensure all changes follow conventional commit format
2. Merge to `main` branch
3. Wait for release-please to create the release PR
4. Review and merge the release PR

## Configuration Files

- `.release-please-manifest.json` - Tracks current versions of all packages
- `release-please-config.json` - Configuration for release-please
- `.github/workflows/release.yml` - GitHub Actions workflow for releases



## Troubleshooting

### Release PR Not Created

- Verify commits follow conventional commit format
- Check that commits contain changes that warrant a version bump (feat, fix, perf, or breaking changes)
- Review the release workflow logs in GitHub Actions



## More Information

- [release-please documentation](https://github.com/googleapis/release-please)
- [Conventional Commits specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
