import * as Sentry from '@sentry/nextjs';
import {
  apiPlugin,
  getStoryblokApi,
  ISbStoriesParams,
  StoryblokClient,
  storyblokInit,
  StoryblokStory,
} from '@storyblok/react/rsc';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPageMetadata } from '@/lib/getPageMetadata';
import { resolveRelations } from '@/lib/resolveRelations';

import ComponentNotFound from '@/components/bloks/ComponentNotFound';
import { components as Components } from '@/components/helpers/StoryblokProvider';

import { isProd } from '@/constant/env';

type PathsType = {
  slug: string[];
};

type ParamsType = {
  slug: string[];
};

// Bug in Safari + Netlify + Next where back button doesn't function correctly and returns the user
// back to the page they hit the back button on after scrolling or interacting with the page they went back to.
// Setting a long revalidate time patches this until Next/Netlify fix the bug in future releases of their stuff.
export const revalidate = 3600;

// Storyblok bridge options.
const bridgeOptions = {
  resolveRelations,
  resolveLinks: 'story',
};

/**
 * Init on the server.
 */
storyblokInit({
  accessToken: process.env.STORYBLOK_ACCESS_TOKEN, // Preview token because this is in server side.
  use: [apiPlugin],
  components: Components,
  enableFallbackComponent: true,
  customFallbackComponent: (component) => {
    return <ComponentNotFound component={component} />;
  },
});

/**
 * Generate the list of stories to statically render.
 */
export async function generateStaticParams() {
  // Fetch new content from storyblok.
  const storyblokApi: StoryblokClient = getStoryblokApi();
  const sbParams: ISbStoriesParams = {
    version: isProd ? 'published' : 'draft',
    cv: isProd ? undefined : Date.now(),
    resolve_links: '0',
    resolve_assets: 0,
    per_page: 100,
  };

  // Use the `cdn/links` endpoint to get a list of all stories without all the extra data.
  const response = await storyblokApi.getAll('cdn/links', sbParams);
  const stories = response.filter((link) => link.is_folder === false);
  const paths: PathsType[] = [];

  stories.forEach((story) => {
    const slug = story.slug;
    // Filter out the home page.
    if (slug !== 'home') {
      const splitSlug = slug.split('/');
      paths.push({ slug: splitSlug });
    }
  });

  return paths;
}

/**
 * Get the data out of the Storyblok API for the page.
 *
 * Make sure to not export the below functions otherwise there will be a typescript error
 * https://github.com/vercel/next.js/discussions/48724
 */
async function getStoryData(params: { slug: string[] }) {
  const storyblokApi: StoryblokClient = getStoryblokApi();
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : 'home';

  const sbParams: ISbStoriesParams = {
    version: isProd ? 'published' : 'draft',
    cv: isProd ? undefined : Date.now(),
    resolve_relations: resolveRelations,
  };

  try {
    const story = await storyblokApi.get(`cdn/stories/${slug}`, sbParams);
    return story;
  } catch (error) {
    if (typeof error === 'string') {
      try {
        const parsedError = JSON.parse(error);
        if (parsedError.status === 404) {
          return { data: 404 };
        }
      } catch (e) {
        Sentry.captureException(new Error(`Storyblok error: ${error}`));
      }
    }
  }

  return { data: 404 };
}

/**
 * Generate the SEO metadata for the page.
 */
export async function generateMetadata({
  params,
}: {
  params: ParamsType;
}): Promise<Metadata> {
  try {
    const { data } = await getStoryData(params);
    if (!data.story || !data.story.content) {
      notFound();
    }
    const blok = data.story.content;
    const slug = params.slug ? params.slug.join('/') : 'home';
    const meta = getPageMetadata({ blok, slug });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return meta;
  } catch (error) {
    Sentry.captureException(
      new Error(`Metadata error: ${error} for ${params.slug}`)
    );
  }

  notFound();
}

/**
 * Fetch the path data for the page and render it.
 */
export default async function Page({ params }: { params: ParamsType }) {
  const { data } = await getStoryData(params);
  const slug = params.slug ? params.slug.join('/') : '';

  if (data === 404) {
    notFound();
  }

  return (
    <StoryblokStory
      story={data.story}
      bridgeOptions={bridgeOptions}
      slug={slug}
    />
  );
}
