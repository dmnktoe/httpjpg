import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { CMS_TAGS } from "@httpjpg/storyblok-next";
import { type MenuLink, type SbConfigStory, storyblokHref } from "@httpjpg/storyblok-ui";
import type { SbUserbarData } from "@httpjpg/storyblok-utils";
import { isExternalLink, type NavItem, type UserbarItem } from "@httpjpg/ui";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";

import { STORYBLOK_SLUGS } from "../storyblok-slugs";

export async function getConfig(): Promise<SbConfigStory | null> {
  const { isEnabled } = await draftMode();
  try {
    if (isEnabled) {
      await connection();
      return await loadConfig(true);
    }
    return await readPublishedConfig();
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error fetching config:", error);
    captureServerException(error, { tags: { query: "config" } });
    return null;
  }
}

async function readPublishedConfig(): Promise<SbConfigStory | null> {
  "use cache";
  cacheTag(CMS_TAGS.config, CMS_TAGS.story(STORYBLOK_SLUGS.CONFIG));
  const config = await loadConfig(false);
  if (!config) {
    // Null is a failed fetch: hold it for seconds, not the hour (see `readStory`).
    cacheLife("seconds");
    return null;
  }
  cacheLife("cms");
  return config;
}

async function loadConfig(draft: boolean): Promise<SbConfigStory | null> {
  const story = await getStoryblokApi({ draftMode: draft }).getStory({
    slug: STORYBLOK_SLUGS.CONFIG,
    resolve_relations: ["menu_link.link"],
  });
  return (story?.content as SbConfigStory) ?? null;
}

function toNavItem(item: MenuLink): NavItem | null {
  if (!item.label || !item.link) {
    return null;
  }
  const href = storyblokHref(item.link);
  const isExternal = item.is_external ?? isExternalLink(href);
  return { name: item.label, href, isExternal };
}

export async function getNavigation(): Promise<NavItem[]> {
  const config = await getConfig();
  if (!config?.header_menu?.length) {
    return [];
  }
  return config.header_menu.map(toNavItem).filter((item): item is NavItem => item !== null);
}

export async function getFooterConfig(): Promise<{
  copyrightText?: string;
  footerLinks?: NavItem[];
  backgroundImage?: string;
  userbars: UserbarItem[];
}> {
  const footerConfig = (await getConfig())?.footer_config?.[0];
  if (!footerConfig) {
    return { backgroundImage: "https://www.httpjpg.com/images/footer_bg.png", userbars: [] };
  }
  return {
    copyrightText: footerConfig.copyright_text,
    footerLinks: footerConfig.footer_links
      ?.map(toNavItem)
      .filter((item): item is NavItem => item !== null),
    backgroundImage: footerConfig.background_image?.filename,
    userbars: toUserbars(footerConfig.userbars),
  };
}

function toUserbars(bloks: SbUserbarData[] | undefined): UserbarItem[] {
  if (!bloks?.length) {
    return [];
  }
  const items: UserbarItem[] = [];
  for (const blok of bloks) {
    const image = blok.image;
    const src = image?.filename;
    if (!src) {
      continue;
    }
    const href = storyblokHref(blok.link);
    items.push({
      src,
      alt: blok.alt || image.alt || "userbar",
      ...(href ? { href } : {}),
    });
  }
  return items;
}

/** Site identity from the CMS. A missing field drops its output; no code fallback. */
export interface SiteConfig {
  name?: string;
  /** Open Graph / schema.org locale, e.g. `de_DE`. */
  locale?: string;
  /** `<html lang>` form of the locale, e.g. `de`. */
  htmlLang?: string;
  /** BCP 47 form of the locale, e.g. `de-DE`. */
  language?: string;
  repositoryUrl?: string;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const story = await getConfig();
  const locale = story?.site_locale || undefined;
  return {
    name: story?.site_name || undefined,
    locale,
    htmlLang: locale?.split("_")[0],
    language: locale?.replace("_", "-"),
    repositoryUrl: story?.repository_url || undefined,
  };
}

export interface SiteAuthor {
  name: string;
  url?: string;
}

export async function getAuthor(): Promise<SiteAuthor | null> {
  const config = await getConfig();
  if (!config?.author_name) {
    return null;
  }
  return { name: config.author_name, url: config.author_url || undefined };
}

/** Profile URLs for the author's schema.org `sameAs`. */
export async function getSocialProfiles(): Promise<string[]> {
  const config = await getConfig();
  return (
    config?.social_profiles
      ?.map((profile) => profile.url?.trim())
      .filter((url): url is string => Boolean(url)) ?? []
  );
}

export async function getSeoDefaults(): Promise<{
  title?: string;
  description?: string;
}> {
  const config = await getConfig();
  return {
    title: config?.seo_title || undefined,
    description: config?.seo_description || undefined,
  };
}
