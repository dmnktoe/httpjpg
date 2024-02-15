import {
  getStoryblokApi,
  ISbStoriesParams,
  StoryblokStory,
} from '@storyblok/react/rsc';
import { Metadata } from 'next';
import { draftMode } from 'next/headers';

import { HeaderNeu } from '@/components/layout/HeaderNeu';

const isDev = process.env.NODE_ENV === 'development';
export let revalidate: number;
if (isDev) {
  revalidate = 0;
} else {
  revalidate = 3600;
}

async function fetchData(slug: string) {
  const { isEnabled: isDraft } = draftMode();
  const sbParams: ISbStoriesParams = {
    resolve_links: 'url',
    version: isDev || isDraft ? 'draft' : 'published',
    cv: isDev || isDraft ? Date.now() : undefined,
  };

  const storyblokApi = getStoryblokApi();

  return storyblokApi.get(`cdn/stories/${slug}`, sbParams);
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const storyblokApi = getStoryblokApi();
  const { data } = await storyblokApi.get('cdn/links/', {
    version: 'published',
  });

  const paths: { slug: string[] }[] = [];
  // create a route for every link
  Object.keys(data.links).forEach((linkKey) => {
    // do not create a route for folders and home
    if (data.links[linkKey].is_folder || data.links[linkKey].slug === 'home') {
      return;
    }

    // get array for slug because of catch all
    const slug = data.links[linkKey].slug;
    const splittedSlug = slug.split('/');

    // creates all the routes
    paths.push({ slug: splittedSlug });
  });

  return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params?.slug ? params.slug.join('/') : 'home';
  const { data } = await fetchData(slug);
  const story = data.story;
  const title = story.content?.seo?.title || story.name;
  const description = story.content?.seo?.description;
  return {
    metadataBase: new URL('https://httpjpg.com'),
    title: `${title} ㋡httpjpg.com`,
    description: description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: title,
      description: description,
      url: `/${story.slug}`,
    },
    twitter: {
      card: 'summary',
      title: title,
      description: description,
    },
  };
}

type Props = {
  params: { slug: string[] };
};

export default async function Home({ params }: Props) {
  const slug = params?.slug ? params.slug.join('/') : 'home';
  const { data } = await fetchData(slug);
  return (
    <>
      <HeaderNeu />

      <StoryblokStory story={data.story} />

      <footer className='p-4'>Your Footer</footer>
    </>
  );
}
