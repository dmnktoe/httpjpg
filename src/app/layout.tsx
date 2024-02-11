import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import * as React from 'react';
import { ReactElement } from 'react';

import '@/styles/globals.css';

import StoryblokProvider from '@/components/helpers/storyblok-provider';

storyblokInit({
  accessToken: process.env.STORYBLOK_TOKEN,
  use: [apiPlugin],
});

type RootLayoutProps = {
  children: ReactElement;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <StoryblokProvider>
      <html lang='de-CH'>
        <body>{children}</body>
      </html>
    </StoryblokProvider>
  );
}
