import React from 'react';

import StoryblokProvider from '@/components/helpers/StoryblokProvider';

type StoryblokLayoutProps = {
  children: React.ReactNode;
};

// Control what happens when a dynamic segment is visited that was not generated with generateStaticParams.
export const dynamic = 'force-dynamic';

export default function StoryblokLayout({ children }: StoryblokLayoutProps) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <StoryblokProvider isEditor={true}>{children}</StoryblokProvider>;
}
