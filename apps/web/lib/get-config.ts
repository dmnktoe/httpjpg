import { CACHE_TAGS, getStoryblokApi } from "@httpjpg/storyblok-api";
import type { MenuLink, SbConfigStory } from "@httpjpg/storyblok-ui";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";

/**
 * Get site config from Storyblok
 * Storyblok story name: "Config" (slug will be lowercase: 'config')
 */
export async function getConfig(): Promise<SbConfigStory | null> {
  const { isEnabled } = await draftMode();

  // Use direct fetch with caching
  const fetchConfig = async () => {
    const api = getStoryblokApi({ draftMode: isEnabled });

    try {
      // Slug is lowercase, even if story name is "Config"
      // Resolve relations if menu items reference other stories
      const story = await api.getStory({
        slug: "config",
        resolve_relations: ["menu_link.link"],
      });

      if (!story || !story.content) {
        console.warn(
          "Config story not found. Create a story with name 'Config' (slug: 'config')",
        );
        return null;
      }

      return story.content as SbConfigStory;
    } catch (error) {
      console.error("Error fetching config:", error);
      return null;
    }
  };

  // Cache in production, fresh in draft mode
  if (isEnabled) {
    return fetchConfig();
  }

  return unstable_cache(fetchConfig, ["config-story"], {
    tags: [CACHE_TAGS.CONFIG, CACHE_TAGS.STORY("config")],
    revalidate: 3600,
  })();
}

/**
 * Get navigation items from config
 */
export async function getNavigation() {
  const config = await getConfig();

  if (!config?.header_menu || config.header_menu.length === 0) {
    // Fallback navigation
    return [
      { name: "Home", href: "/", isExternal: false },
      { name: "Work", href: "/work", isExternal: false },
      { name: "About", href: "/about", isExternal: false },
      { name: "Contact", href: "/contact", isExternal: false },
    ];
  }

  return config.header_menu
    .filter((item): item is MenuLink => {
      // Support both 'label' (correct) and 'name' (legacy) fields
      const displayName = (item as any).label || (item as any).name;
      return Boolean(displayName && item?.link);
    })
    .map((item) => {
      // Support both 'label' (correct) and 'name' (legacy) fields
      const displayName = (item as any).label || (item as any).name;

      const href =
        item.link.linktype === "story"
          ? `/${item.link.cached_url}`
          : item.link.url || "/";

      // Auto-detect external links if not explicitly set
      const isExternalLink =
        item.is_external !== undefined
          ? item.is_external
          : href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:");

      return {
        name: displayName,
        href,
        isExternal: isExternalLink,
      };
    });
}

/**
 * Get recent work items from Storyblok
 */
export async function getRecentWork(): Promise<{
  personalWork: Array<{
    id: string;
    slug: string;
    title: string;
    imageUrl?: string;
    isExternal?: boolean;
  }>;
  clientWork: Array<{
    id: string;
    slug: string;
    title: string;
    imageUrl?: string;
    isExternal?: boolean;
  }>;
}> {
  const fetchWork = async () => {
    try {
      // Get draft stories (all stories including unpublished)
      const draftApi = getStoryblokApi({ draftMode: true });
      const draftResponse = await draftApi.getStories({
        starts_with: "work/",
        per_page: 100,
        sort_by: "first_published_at:desc",
        cv: Date.now(),
      });

      const allStories = draftResponse.stories || [];

      // Get published stories to check which ones are actually published
      // Note: We must explicitly use published version, not the env default
      const publishedApi = getStoryblokApi({ draftMode: false });
      const publishedResponse = await publishedApi.getStories({
        starts_with: "work/",
        per_page: 100,
        version: "published", // Force published version
      });

      // Filter to only truly published stories (have first_published_at)
      const publishedStories = (publishedResponse.stories || []).filter(
        (s: any) => s.first_published_at !== null,
      );

      const publishedUuids = new Set(publishedStories.map((s: any) => s.uuid));

      // Filter: Only stories directly under work/ (not work/random/ or other subfolders)
      const workStories = allStories.filter((story: any) => {
        const slug = story.full_slug || story.slug;
        // Must start with work/ but not have another / after work/
        return slug.startsWith("work/") && slug.split("/").length === 2;
      });

      // In development, show all. In production, only show published.
      const storiesToUse =
        process.env.NODE_ENV === "development"
          ? workStories
          : workStories.filter((story: any) => publishedUuids.has(story.uuid));

      // Map all stories to work items
      const workItems = storiesToUse.slice(0, 10).map((story: any) => {
        const isDraft = !publishedUuids.has(story.uuid);

        // Check if this is an external-only work item
        const isExternalOnly = story.content?.external_only === true;
        const externalUrl =
          story.content?.link?.url || story.content?.link?.cached_url;

        // Use external URL if external_only is set, otherwise use internal slug
        const href = isExternalOnly && externalUrl ? externalUrl : story.slug;

        return {
          id: story.uuid,
          slug: href,
          title: story.content?.title || story.name,
          imageUrl: story.content?.images?.[0]?.filename,
          isDraft,
          isExternal: isExternalOnly,
        };
      });

      // Split into personal and client based on tags (if they have tags)
      const personalWork = workItems.filter((item: any) => {
        const story = workStories.find((s: any) => s.uuid === item.id);
        return (
          !story?.tag_list ||
          story.tag_list.length === 0 ||
          story.tag_list.includes("Personal")
        );
      });

      const clientWork = workItems.filter((item: any) => {
        const story = workStories.find((s: any) => s.uuid === item.id);
        return story?.tag_list?.includes("Client");
      });

      return {
        personalWork,
        clientWork,
      };
    } catch (error) {
      console.error("Error fetching work items:", error);
      return {
        personalWork: [],
        clientWork: [],
      };
    }
  };

  // Always fresh in development
  if (process.env.NODE_ENV === "development") {
    return fetchWork();
  }

  // Cache in production
  return unstable_cache(fetchWork, ["recent-work"], {
    tags: [CACHE_TAGS.STORIES],
    revalidate: 3600, // Cache for 1 hour
  })();
}

/**
 * Get footer configuration from config
 */
export async function getFooterConfig(): Promise<{
  copyrightText?: string;
  showDefaultLinks?: boolean;
  socialLinks?: Array<{ platform: string; url: string }>;
  backgroundImage?: string;
}> {
  const config = await getConfig();
  const footerConfig = config?.footer_config?.[0];

  if (!footerConfig) {
    return {
      showDefaultLinks: false,
      backgroundImage: "https://www.httpjpg.com/images/footer_bg.png",
    };
  }

  return {
    copyrightText: footerConfig.copyright_text,
    showDefaultLinks: footerConfig.show_default_links ?? false,
    socialLinks: footerConfig.social_links?.map((link) => ({
      platform: link.platform,
      url: link.url,
    })),
    backgroundImage: footerConfig.background_image?.filename,
  };
}
