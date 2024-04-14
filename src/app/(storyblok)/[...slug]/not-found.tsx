import {
  apiPlugin,
  getStoryblokApi,
  ISbStoriesParams,
  StoryblokClient,
  storyblokInit,
  StoryblokStory,
} from '@storyblok/react/rsc';

import { resolveRelations } from '@/lib/resolveRelations';

import { isProd } from '@/data/env';

import { components as Components } from '@/components/helpers/StoryblokProvider';
import ComponentNotFound from '@/components/storyblok/ComponentNotFound';

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
async function getStoryData(slug = 'page-not-found') {
  const storyblokApi: StoryblokClient = getStoryblokApi();
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

export default async function NotFound() {
  const { data } = await getStoryData();

  if (data === 404) {
    return (
      <>
        <h1>Error: Could not find page</h1>
        <p>
          Slug{' '}
          <code>
            <b>page-not-found</b>
          </code>{' '}
          could not be found in the CMS.
        </p>
      </>
    );
  }

  return <StoryblokStory story={data.story} bridgeOptions={bridgeOptions} />;
}
