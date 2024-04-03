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
import React from 'react';

import { getPageMetadata } from '@/lib/getPageMetadata';
import { resolveRelations } from '@/lib/resolveRelations';

import { isProd } from '@/data/env';

import StoryblokProvider, {
  components as Components,
} from '@/components/helpers/StoryblokProvider';
import ComponentNotFound from '@/components/storyblok/ComponentNotFound';

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
  accessToken: process.env.STORYBLOK_TOKEN, // Preview token because this is in server side.
  use: [apiPlugin],
  components: Components,
  enableFallbackComponent: true,
  customFallbackComponent: (component) => {
    return <ComponentNotFound component={component} />;
  },
});

/**
 * Get the data out of the Storyblok API for the page.
 *
 * Make sure to not export the below functions otherwise there will be a typescript error
 * https://github.com/vercel/next.js/discussions/48724
 */
async function getStoryData() {
  const storyblokApi: StoryblokClient = getStoryblokApi();
  const slug = 'home';

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
        throw error;
      }
    }
    throw error;
  }
}

export async function getHeaderData() {
  const storyblokApi: StoryblokClient = getStoryblokApi();

  const config = await storyblokApi.get(`cdn/stories/config`, {
    version: 'draft',
    resolve_links: 'url',
  });

  const nav = config.data.story.content.header_menu;

  const work = await storyblokApi.get(`cdn/stories`, {
    starts_with: 'work/',
    cv: Date.now(),
    version: 'draft',
    resolve_links: 'url',
  });

  const filterStoriesByTag = (
    tag: string,
    stories: { tag_list: string | string[] }[]
  ) =>
    stories.filter(
      (story) => Array.isArray(story.tag_list) && story.tag_list.includes(tag)
    );

  const personal = filterStoriesByTag('Personal', work.data.stories);
  const client = filterStoriesByTag('Client', work.data.stories);

  return {
    props: {
      header: {
        nav: nav,
        personal: personal,
        client: client,
      },
    },
    revalidate: 3600,
  };
}

/**
 * Generate the SEO metadata for the page.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await getStoryData();
    if (!data.story || !data.story.content) {
      throw new Error(`No story data found for home`);
    }
    const blok = data.story.content;
    const slug = 'home';
    const meta = getPageMetadata({ blok, slug });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return meta;
  } catch (error) {
    Sentry.captureException(new Error(`Metadata error: ${error}`));
  }

  return {};
}

/**
 * Fetch the path data for the page and render it.
 */
export default async function Page() {
  const { data } = await getStoryData();
  const slug = '/';

  if (!data.story) {
    notFound();
  }

  return (
    <StoryblokProvider>
      <StoryblokStory
        story={data.story}
        bridgeOptions={bridgeOptions}
        slug={slug}
      />
    </StoryblokProvider>
  );
}
