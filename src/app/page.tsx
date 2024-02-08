// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getStoryblokApi } from '@storyblok/react/rsc';
import * as React from 'react';
/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */
import 'swiper/css';

import { projects } from '@/data/projects';

import { ProjectList } from '@/components/templates/project-list';

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

export default async function HomePage() {
  const { data } = await fetchData();
  return (
    <main>
      <div>
        <h1>Story: {data.story.name}</h1>
      </div>
      <ProjectList projects={projects} />
    </main>
  );
}

export async function fetchData() {
  const sbParams = { version: 'draft' };

  const storyblokApi = getStoryblokApi();
  return storyblokApi.get(`cdn/stories/home`, sbParams, { cache: 'no-store' });
}
