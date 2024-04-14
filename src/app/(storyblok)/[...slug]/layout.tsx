import React from 'react';

import StoryblokProvider from '@/components/helpers/StoryblokProvider';

type StoryblokLayoutProps = {
  children: React.ReactNode;
};

export default function StoryblokLayout({ children }: StoryblokLayoutProps) {
  return <StoryblokProvider>{children}</StoryblokProvider>;
}
