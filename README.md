<div align="center">

# httpjpg.com ✦

**A brutalist design portfolio monorepo**

Modern web portfolio built with Next.js, Storyblok CMS, and Panda CSS.
Showcasing projects, art, and development work through a unique design language.

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/dmnktoe/httpjpg/ci.yml?branch=main&logo=github&logoColor=fff&label=CI&labelColor=000)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/dmnktoe/httpjpg?label=Issues&logo=Github&logoColor=fff&style=flat&labelColor=000&color=e61e8d)
![GitHub Release](https://img.shields.io/github/v/release/dmnktoe/httpjpg?label=Release&logo=Github&logoColor=fff&style=flat&labelColor=000&color=00b4f0)
![Codecov](https://img.shields.io/codecov/c/github/dmnktoe/httpjpg?logo=codecov&logoColor=fff&label=Coverage&labelColor=000)

[View Live](https://httpjpg.com/) · [Report Bug](https://github.com/dmnktoe/httpjpg/issues) · [Request Feature](https://github.com/dmnktoe/httpjpg/issues)

</div>

---

## ✦ About

My personal portfolio and creative space built as a modern monorepo. Showcasing projects, design work, and experiments through a brutalist aesthetic with custom components and a headless CMS.

Built with Next.js, Panda CSS, and Storyblok. Type-safe, tested, and documented.

---

## What Makes It Special

**Brutalist Design Language**
Impact typography, monochrome palette, ASCII decorations (✦, ･ﾟ⋆, 🎀), and a custom cursor that adds personality without sacrificing clarity.

**Modular Component System**
Every UI element is reusable, documented in Storybook, and built with design tokens for consistency across the entire site.

**Content-Driven**
Powered by Storyblok CMS with live preview, making it easy to update projects and content without touching code.

---

## What's Inside

```
apps/
  web/              → Portfolio website
  storybook/        → Component showcase
  docs/             → Documentation

packages/
  ui/               → Component library
  tokens/           → Design system
  storyblok-api/    → CMS API client
  storyblok-ui/     → CMS components
  storyblok-sync/   → CMS sync scripts
  storyblok-utils/  → CMS utilities
  storyblok-richtext/ → Rich text renderer
  analytics/        → Google Analytics
  consent/          → Cookie consent
  observability/    → Sentry & Datadog
  security/         → Arcjet protection
  env/              → Environment config
  typescript/       → TS configs
  now-playing/      → Spotify widget
  feature-flags/    → Feature toggles
```

A Turborepo monorepo with shared packages for UI components, design tokens, and CMS utilities.

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Open http://localhost:3000
```

**Requirements:** Node.js 20+, pnpm 9+

For CMS integration, add your Storyblok token to `.env.local` (see `.env.example`).

---

## Development

```bash
pnpm dev              # Start all apps
pnpm build            # Build everything
pnpm test             # Run tests
pnpm lint             # Check code quality
```

Each package can be developed independently in watch mode.

---

## Contributing

Pull requests welcome! For major changes, open an issue first.

1. Fork the repo
2. Create your branch (`git checkout -b feature/cool-thing`)
3. Commit changes (`git commit -m 'Add cool thing'`)
4. Push (`git push origin feature/cool-thing`)
5. Open a PR

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚

**Domenik Töfflinger** · [@dmnktoe](https://github.com/dmnktoe)<br/>
**Instagram** · [@icon.icon.iconn](https://instagram.com/icon.icon.iconn)

</div>
