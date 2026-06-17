/**
 * Deterministic Storyblok CDN mock for E2E.
 *
 * Playwright starts this alongside the app and points the Storyblok client at it
 * via `STORYBLOK_API_ENDPOINT` (see playwright.config.ts), so the suite never
 * depends on live CMS data. It mirrors the subset of the Storyblok CDN API that
 * `@httpjpg/storyblok-api` consumes (`cdn/stories/<slug>`, `cdn/stories`,
 * `cdn/links`, `cdn/spaces/me`). The HTTP body is the *unwrapped* payload
 * (`{ story }` / `{ stories }` / `{ links }`); storyblok-js-client adds the
 * `data` envelope and reads list totals from the `total` / `per-page` headers.
 *
 * Every unknown story slug resolves to a generic page fixture, so any internal
 * link the app renders navigates to a real page (no 404s) — keeping the tests
 * deterministic regardless of what is (or isn't) published.
 */
import { createServer } from "node:http";

const PORT = Number(process.env.STORYBLOK_MOCK_PORT) || 4000;
const TS = "2026-01-01T00:00:00.000Z";

function slugId(slug) {
  let hash = 7;
  for (const char of slug) {
    hash = (hash * 31 + char.charCodeAt(0)) & 0x7fffffff;
  }
  return hash;
}

function baseStory(fullSlug, content) {
  const slug = fullSlug.split("/").filter(Boolean).pop() ?? fullSlug;
  return {
    id: slugId(fullSlug),
    uuid: `uuid-${fullSlug.replace(/\//g, "-")}`,
    slug,
    full_slug: fullSlug,
    name: slug,
    created_at: TS,
    published_at: TS,
    first_published_at: TS,
    sort_by_date: null,
    position: 0,
    tag_list: [],
    is_startpage: fullSlug === "home",
    parent_id: null,
    lang: "default",
    translated_slugs: null,
    alternates: [],
    content,
  };
}

function pageContent(title, text) {
  return {
    _uid: `page-${slugId(title)}`,
    component: "page",
    isDark: false,
    title,
    body: [
      { _uid: `headline-${slugId(title)}`, component: "headline", text: title, level: "1" },
      { _uid: `paragraph-${slugId(title)}`, component: "paragraph", text },
    ],
  };
}

const HOME = baseStory(
  "home",
  pageContent(
    "Welcome to httpjpg",
    "Deterministic end-to-end fixture content, rendered without any live Storyblok data.",
  ),
);

const CONFIG = baseStory("config", {
  _uid: "config",
  component: "config",
  seo_title: "httpjpg — E2E fixtures",
  seo_description: "Deterministic E2E fixtures, no live CMS data.",
  author_name: "httpjpg",
  author_url: "https://httpjpg.com",
  header_menu: [
    {
      _uid: "menu-work",
      component: "menu_link",
      label: "Work",
      link: { linktype: "story", cached_url: "work/example", id: "101" },
    },
  ],
  footer_config: [
    { _uid: "footer", component: "footer_config", copyright_text: "© httpjpg", footer_links: [] },
  ],
  spotify_enabled: false,
  nostalgia_slideshow_enabled: false,
  psn_enabled: false,
  psn_trophy_enabled: false,
  discord_enabled: false,
  letterboxd_enabled: false,
  custom_cursor_enabled: false,
  mouse_trail_enabled: false,
  last_updated_badge_enabled: false,
  prev_next_work_enabled: false,
  rss_feed_enabled: true,
});

const STORIES = { home: HOME, config: CONFIG };

function getStory(slug) {
  return (
    STORIES[slug] ??
    baseStory(
      slug,
      pageContent(
        "Fixture page",
        `Deterministic fixture page for "${slug}", rendered without live data.`,
      ),
    )
  );
}

function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (pathname === "/health") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }

  const cdnIndex = pathname.indexOf("/cdn/");
  if (cdnIndex === -1) {
    sendJson(res, 404, { error: "not found" });
    return;
  }

  const rest = pathname.slice(cdnIndex + "/cdn/".length);

  if (rest.startsWith("spaces")) {
    sendJson(res, 200, { space: { id: 1, version: 1700000000 } });
    return;
  }
  if (rest === "links") {
    sendJson(res, 200, { links: {} });
    return;
  }
  if (rest === "stories") {
    sendJson(res, 200, { stories: [] }, { total: "0", "per-page": "25" });
    return;
  }
  if (rest.startsWith("stories/")) {
    const slug = decodeURIComponent(rest.slice("stories/".length));
    sendJson(res, 200, { story: getStory(slug) });
    return;
  }

  sendJson(res, 404, { error: "not found" });
});

server.listen(PORT);
