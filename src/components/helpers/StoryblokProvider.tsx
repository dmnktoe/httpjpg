'use client';

import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import React from 'react';

import ComponentNotFound from '@/components/storyblok/ComponentNotFound';
import { SbGrid } from '@/components/storyblok/SbGrid';
import { SbImage } from '@/components/storyblok/SbImage';
import { SbPage } from '@/components/storyblok/SbPage';
import { SbSection } from '@/components/storyblok/SbSection';
import { SbSlideshow } from '@/components/storyblok/SbSlideshow';
import { SbText } from '@/components/storyblok/SbText';
import { SbWork } from '@/components/storyblok/SbWork';
import { SbWorkList } from '@/components/storyblok/SbWorkList';

export const components = {
  grid: SbGrid,
  image: SbImage,
  page: SbPage,
  section: SbSection,
  slideshow: SbSlideshow,
  text: SbText,
  work: SbWork,
  'work-list': SbWorkList,
};

interface ProviderProps {
  children: React.ReactNode;
  isEditor?: boolean;
}

export default function StoryblokProvider({
  children,
  isEditor = false,
}: ProviderProps) {
  let accessToken = ''; // No access token because this is in client side code.
  if (isEditor) {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      accessToken = urlParams.get('_storyblok_tk[token]') || accessToken;
    }
  }

  // Temporarily override console.error to squelch errors from Storyblok.
  // Storyblok Init wants an api key, but I don't want it in the client side code nor do I want to fetch from
  // Storyblok API on the front end.
  // eslint-disable-next-line no-console
  const originalConsoleError = console.error;
  // eslint-disable-next-line no-console, @typescript-eslint/no-empty-function
  console.error = () => {};

  // Init the Storyblok client so we can use the Storyblok components.
  storyblokInit({
    accessToken,
    use: [apiPlugin],
    components,
    enableFallbackComponent: true,
    customFallbackComponent: (component) => {
      return <ComponentNotFound component={component} />;
    },
  });

  // Return the console.error to its original state.
  // eslint-disable-next-line no-console
  console.error = originalConsoleError;

  return <>{children}</>;
}
