'use client';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';

import Grid from '@/components/layout/grid';
import Page from '@/components/layout/page';

const components = {
  Page,
  Grid,
};

storyblokInit({
  accessToken: 'PLkrO3gfRkjDlF4jwoQI8wtt',
  use: [apiPlugin],
  components,
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default function StoryblokProvider({ children }) {
  return children;
}
