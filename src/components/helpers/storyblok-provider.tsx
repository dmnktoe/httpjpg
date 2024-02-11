'use client';
import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import { ReactElement } from 'react';

import SbPage from '@/components/bloks/SbPage';

const components = {
  page: SbPage,
};

storyblokInit({
  accessToken: process.env.STORYBLOK_TOKEN,
  use: [apiPlugin],
  components,
});

type StoryblokProviderProps = {
  children: ReactElement;
};

export default function StoryblokProvider({
  children,
}: StoryblokProviderProps) {
  return children;
}
