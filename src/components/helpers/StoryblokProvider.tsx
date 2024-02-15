'use client';
import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import { ReactElement } from 'react';

import SbContainer from '@/components/bloks/SbContainer';
import SbPage from '@/components/bloks/SbPage';
import SbSlideshow from '@/components/bloks/SbSlideshow';

const components = {
  container: SbContainer,
  page: SbPage,
  slideshow: SbSlideshow,
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
