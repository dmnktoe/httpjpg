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
      header_menu: field.bloks("Header Menu", { whitelist: ["menu_link"] }),
      footer_config: field.bloks("Footer", {
        whitelist: ["footer_config"],
        maximum: 1,
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
        spotify_enabled: field.boolean("Spotify · Now Playing", "true"),
        nostalgia_slideshow_enabled: field.boolean("Nostalgia · Slideshow", "true"),
        psn_enabled: field.boolean("PSN · Trophy Card"),
        psn_trophy_enabled: field.boolean("PSN · Latest Trophy"),
        psn_username: field.text("PSN · Username"),
        discord_user_id: field.text("Discord · User ID", {
          description: "17–20 digit Discord snowflake; powers the live status widget.",
          tooltip: true,
        }),
        letterboxd_username: field.text("Letterboxd · Username"),
        custom_cursor_enabled: field.boolean("Custom Cursor", "true"),
        mouse_trail_enabled: field.boolean("Mouse Trail", "true"),
      }),
      ...tabbed("Features", "features", {
        last_updated_badge_enabled: field.boolean("Last-Updated · Footer Badge", "true"),
        prev_next_work_enabled: field.boolean("Prev/Next · Work Navigation", "true"),
        rss_feed_enabled: field.boolean("RSS Feed · /work/feed.xml", "true"),
      }),
    },
  },
];
