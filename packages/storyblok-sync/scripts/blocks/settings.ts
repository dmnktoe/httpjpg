import type { BlockDef } from "../lib/block";
import { field, tabbed } from "../lib/fields";

export const settingsBlocks: BlockDef[] = [
  {
    name: "menu_link",
    display_name: "Menu Link",
    group: "Settings",
    icon: "block-link",
    color: "#8b5cf6",
    preview_field: "label",
    schema: {
      label: field.text("Label", { required: true, translatable: true }),
      link: field.multilink("Link", { required: true }),
      variant: field.options(
        "Variant",
        [
          { name: "Projects", value: "projects" },
          { name: "Websites", value: "websites" },
        ],
        { default_value: "projects" },
      ),
      is_external: field.boolean("Force External"),
      target: field.options(
        "Target",
        [
          { name: "Same Tab", value: "_self" },
          { name: "New Tab", value: "_blank" },
        ],
        { default_value: "_self" },
      ),
    },
  },
  {
    name: "social_profile",
    display_name: "Social Profile",
    group: "Settings",
    icon: "block-share",
    color: "#8b5cf6",
    preview_field: "url",
    schema: {
      platform: field.options(
        "Platform",
        [
          "Instagram",
          "GitHub",
          "SoundCloud",
          "Bandcamp",
          "Spotify",
          "Discogs",
          "Letterboxd",
          "X",
          "LinkedIn",
          "Mastodon",
          "Other",
        ],
        { default_value: "Instagram" },
      ),
      url: field.text("Profile URL", {
        required: true,
        description: "Full URL (incl. https://). Emitted as schema.org sameAs for the author.",
        tooltip: true,
      }),
    },
  },
  {
    name: "footer_config",
    display_name: "Footer Config",
    group: "Settings",
    icon: "block-layout-footer",
    color: "#8b5cf6",
    schema: {
      copyright_text: field.text("Copyright Text"),
      footer_links: field.bloks("Footer Links", { whitelist: ["menu_link"] }),
      background_image: field.asset("Background Image", ["images"]),
    },
  },
  {
    name: "config",
    display_name: "Config",
    group: "Settings",
    is_root: true,
    icon: "block-settings-2",
    color: "#8b5cf6",
    schema: {
      ...tabbed("General", "general", {
        site_name: field.text("Site Name", {
          required: true,
          default_value: "㋡httpjpg.com",
          description:
            "The only place the site is named. Suffixes every page title and fills the Open Graph site name; empty means no suffix at all.",
          tooltip: true,
        }),
        site_locale: field.options(
          "Locale",
          [
            { name: "Deutsch (de_DE)", value: "de_DE" },
            { name: "English · US (en_US)", value: "en_US" },
            { name: "English · UK (en_GB)", value: "en_GB" },
          ],
          {
            required: true,
            default_value: "de_DE",
            description: "Drives <html lang>, the Open Graph locale and schema.org inLanguage.",
            tooltip: true,
          },
        ),
        repository_url: field.text("Repository URL", {
          default_value: "https://github.com/dmnktoe/httpjpg",
          description: "Where the build badge and version link point.",
          tooltip: true,
        }),
        header_menu: field.bloks("Header Menu", { whitelist: ["menu_link"] }),
        footer_config: field.bloks("Footer", {
          whitelist: ["footer_config"],
          maximum: 1,
        }),
        social_profiles: field.bloks("Social Profiles", { whitelist: ["social_profile"] }),
      }),
      ...tabbed("SEO", "seo", {
        seo_title: field.text("Default Page Title", { translatable: true }),
        seo_description: field.textarea("Default Page Description", { translatable: true }),
        author_name: field.text("Author · Name"),
        author_url: field.text("Author · URL", {
          description: "Full URL (incl. https://); used in SEO metadata and structured data.",
          tooltip: true,
        }),
      }),
      ...tabbed("Widgets", "widgets", {
        spotify_enabled: field.boolean("Spotify · Now Playing", "false"),
        nostalgia_slideshow_enabled: field.boolean("Nostalgia · Slideshow", "false"),
        ask_enabled: field.boolean("Ask · Search & AI Palette", "false"),
        discord_enabled: field.boolean("Discord · Live Status", "false"),
        discord_user_id: field.text("Discord · User ID", {
          description: "17–20 digit Discord snowflake; powers the live status widget.",
          tooltip: true,
        }),
        letterboxd_enabled: field.boolean("Letterboxd · Latest Film", "false"),
        letterboxd_username: field.text("Letterboxd · Username"),
        discogs_enabled: field.boolean("Discogs · Latest Record"),
        discogs_username: field.text("Discogs · Username"),
        x_enabled: field.boolean("X · Latest Post"),
        x_username: field.text("X · Username", {
          description: "Handle without @, e.g. dmnktoe. Needs TWEETAPI_KEY to be set.",
          tooltip: true,
        }),
        psn_enabled: field.boolean("PSN · Trophy Card", "false", {
          description: "Floating card with the trophy summary.",
          tooltip: true,
        }),
        psn_trophy_enabled: field.boolean("PSN · Latest Trophy", "false", {
          description: "One-line footer status with the most recent trophy.",
          tooltip: true,
        }),
        psn_username: field.text("PSN · Username"),
      }),
      ...tabbed("Features", "features", {
        last_updated_badge_enabled: field.boolean("Last-Updated · Footer Badge", "false"),
        web_vitals_badge_enabled: field.boolean("Web Vitals · Footer Badge"),
        build_badge_enabled: field.boolean("Build · Footer Badge"),
        prev_next_work_enabled: field.boolean("Prev/Next · Work Navigation", "false"),
        related_work_enabled: field.boolean("Related Work · Tag Neighbours", "false"),
        rss_feed_enabled: field.boolean("RSS Feed · /work/feed.xml", "false"),
      }),
      ...tabbed("Interface", "interface", {
        custom_cursor_enabled: field.boolean("Custom Cursor", "false", {
          description:
            "Draws a ✧ glyph that follows the pointer and reacts to links. Needs a mouse, and stays off under reduced motion.",
          tooltip: true,
        }),
        mouse_trail_enabled: field.boolean("Mouse Trail", "false", {
          description:
            "Trails fading ✧ particles behind the pointer as it moves. Needs a mouse, and stays off under reduced motion.",
          tooltip: true,
        }),
        header_scroll_veil_enabled: field.boolean("Header · Scroll Veil", "false", {
          description:
            "Fades a blurred, theme-aware scrim in behind the header while scrolling, so content passing underneath stays legible. Off leaves the header fully transparent.",
          tooltip: true,
        }),
      }),
    },
  },
];
