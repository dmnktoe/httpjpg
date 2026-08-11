import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { CACHE_TAGS } from "@httpjpg/storyblok-next";
import { type MenuLink, type SbConfigStory, storyblokHref } from "@httpjpg/storyblok-ui";
import { isExternalLink, type NavItem } from "@httpjpg/ui";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";

import { STORYBLOK_SLUGS } from "../storyblok-slugs";

export async function getConfig(): Promise<SbConfigStory | null> {
  const { isEnabled } = await draftMode();

  const fetchConfig = async () => {
    const api = getStoryblokApi({ draftMode: isEnabled });
    try {
      const story = await api.getStory({
        slug: STORYBLOK_SLUGS.CONFIG,
        resolve_relations: ["menu_link.link"],
      });
      return (story?.content as SbConfigStory) ?? null;
    } catch (error) {
      console.error("Error fetching config:", error);
      captureServerException(error, { tags: { query: "config" } });
      return null;
    }
  };

  if (isEnabled) {
    return fetchConfig();
  }
  return unstable_cache(fetchConfig, ["config-story"], {
    tags: [CACHE_TAGS.CONFIG, CACHE_TAGS.STORY(STORYBLOK_SLUGS.CONFIG)],
    revalidate: 3600,
  })();
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
}> {
  const footerConfig = (await getConfig())?.footer_config?.[0];
  if (!footerConfig) {
    return { backgroundImage: "https://www.httpjpg.com/images/footer_bg.png" };
  }
  return {
    copyrightText: footerConfig.copyright_text,
    footerLinks: footerConfig.footer_links
      ?.map(toNavItem)
      .filter((item): item is NavItem => item !== null),
    backgroundImage: footerConfig.background_image?.filename,
  };
}

/**
 * Site identity, authored in the General tab. Every field is optional on
 * purpose: the CMS owns these values outright, so a missing one drops the
 * output that depends on it instead of resurfacing a copy kept in the code.
 */
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
