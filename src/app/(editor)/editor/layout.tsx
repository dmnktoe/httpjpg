import React from 'react';

import StoryblokProvider from '@/components/helpers/StoryblokProvider';

type StoryblokLayoutProps = {
  children: React.ReactNode;
};

// `force-dynamic`: Force dynamic rendering, which will result
// in routes being rendered for each user at request time.
// This option is equivalent to getServerSideProps()
export const dynamic = 'force-dynamic';

export default function StoryblokLayout({ children }: StoryblokLayoutProps) {
  return <StoryblokProvider isEditor={true}>{children}</StoryblokProvider>;
}
