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

import ComponentNotFound from '@/components/bloks/ComponentNotFound';
import StoryblokProvider, {
  components as Components,
} from '@/components/helpers/StoryblokProvider';

import { isProd } from '@/constant/env';

// Bug in Safari + Netlify + Next where back button doesn't function correctly and returns the user
// back to the page they hit the back button on after scrolling or interacting with the page they went back to.
// Setting a long revalidate time patches this until Next/Netlify fix the bug in future releases of their stuff.
// export const revalidate = 60 * 60 * 24 * 365;

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
