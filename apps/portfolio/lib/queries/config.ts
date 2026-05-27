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

const FALLBACK_NAVIGATION: NavItem[] = [
  { name: "Home", href: "/", isExternal: false },
  { name: "Work", href: "/work", isExternal: false },
  { name: "About", href: "/about", isExternal: false },
  { name: "Contact", href: "/contact", isExternal: false },
];

export async function getNavigation(): Promise<NavItem[]> {
  const config = await getConfig();
  if (!config?.header_menu?.length) {
    return FALLBACK_NAVIGATION;
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
