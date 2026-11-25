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

const HOME = baseStory("home", pageContent("Welcome to httpjpg", "httpjpg portfolio e2e fixture."));

const CONFIG = baseStory("config", {
  _uid: "config",
  component: "config",
  site_name: "httpjpg",
  site_locale: "en_US",
  repository_url: "https://github.com/dmnktoe/httpjpg",
  seo_title: "httpjpg",
  seo_description: "httpjpg portfolio.",
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
  schalke_enabled: false,
  custom_cursor_enabled: false,
  mouse_trail_enabled: false,
  last_updated_badge_enabled: false,
  prev_next_work_enabled: false,
  rss_feed_enabled: true,
});

const STORIES = { home: HOME, config: CONFIG };

const WORK_EXAMPLE = baseStory("work/example", {
  _uid: "work-example",
  component: "page_work",
  title: "Example work",
  date: TS,
});

const IMG = `http://127.0.0.1:${PORT}/img`;

function postImage(uid, size, label, fit = "cover") {
  return {
    _uid: uid,
    component: "post_image",
    fit,
    alt: label,
    image: { filename: `${IMG}/${size}/${encodeURIComponent(label)}.svg`, fieldtype: "asset" },
  };
}

const FEED_POSTS = [
  baseStory("feed/20260103-120000-aaaa", {
    _uid: "post-carousel",
    component: "post",
    caption: "harbour dump, three frames",
    date: "2026-01-03 12:00",
    format: "4/5",
    images: [
      postImage("post-carousel-1", "800x1000", "harbour one"),
      postImage("post-carousel-2", "800x1000", "harbour two"),
      postImage("post-carousel-3", "800x1000", "harbour three"),
    ],
    music: [],
  }),
  baseStory("feed/20260102-120000-bbbb", {
    _uid: "post-fitted",
    component: "post",
    caption: "straight off the dsc-w5",
    date: "2026-01-02 12:00",
    format: "1/1",
    images: [postImage("post-fitted-1", "1200x900", "four by three", "contain")],
    music: [],
  }),
  baseStory("feed/20260101-120000-cccc", {
    _uid: "post-music",
    component: "post",
    caption: "new mix",
    date: "2026-01-01 12:00",
    format: "1/1",
    images: [],
    music: [
      {
        _uid: "post-music-track",
        component: "music_player",
        source: "mp3",
        src: `http://127.0.0.1:${PORT}/audio/mix.mp3`,
        title: "fixture mix",
        artist: "httpjpg",
      },
    ],
  }),
];

/** A flat placeholder image, so the feed has pixels to lay out without a CDN. */
function placeholderSvg(size, label) {
  const [width, height] = size.split("x").map(Number);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#2563eb"/><text x="50%" y="50%" fill="#fff" font-family="monospace" font-size="${Math.round(width / 14)}" text-anchor="middle">${label} ${size}</text></svg>`;
}

function getStory(slug, language) {
  const post = FEED_POSTS.find((story) => story.full_slug === slug);
  if (post) {
    return post;
  }

  if (slug === "cv") {
    if (language === "de") {
      return baseStory("cv", pageContent("Lebenslauf", "Deutscher Lebenslauf fuer httpjpg."));
    }
    return baseStory("cv", pageContent("CV", "English CV for httpjpg."));
  }
  return (
    STORIES[slug] ?? baseStory(slug, pageContent("Fixture page", `httpjpg fixture page: ${slug}.`))
  );
}

function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  const { pathname, searchParams } = url;

  if (pathname === "/health") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }

  if (pathname.startsWith("/img/")) {
    const [, , size = "800x800", file = "image.svg"] = pathname.split("/");
    res.writeHead(200, { "content-type": "image/svg+xml", "cache-control": "max-age=3600" });
    res.end(placeholderSvg(size, decodeURIComponent(file).replace(/\.svg$/, "")));
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
    // The RSS feed (the only list read with per_page=50) throws on an empty list;
    // every other list read keeps answering [] so the other pages are unchanged.
    if (searchParams.get("starts_with") === "work/" && searchParams.get("per_page") === "50") {
      sendJson(res, 200, { stories: [WORK_EXAMPLE] }, { total: "1", "per-page": "50" });
      return;
    }
    if (searchParams.get("starts_with") === "feed/") {
      const perPage = Number(searchParams.get("per_page")) || 25;
      const page = Number(searchParams.get("page")) || 1;
      sendJson(
        res,
        200,
        { stories: FEED_POSTS.slice((page - 1) * perPage, page * perPage) },
        { total: String(FEED_POSTS.length), "per-page": String(perPage) },
      );
      return;
    }
    sendJson(res, 200, { stories: [] }, { total: "0", "per-page": "25" });
    return;
  }
  if (rest.startsWith("stories/")) {
    const slug = decodeURIComponent(rest.slice("stories/".length));
    sendJson(res, 200, { story: getStory(slug, searchParams.get("language")) });
    return;
  }

  sendJson(res, 404, { error: "not found" });
});

server.listen(PORT);
