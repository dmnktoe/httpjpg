import {
  SbBlokData,
  StoryblokComponent,
  storyblokEditable,
} from '@storyblok/react/rsc';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';

type SbPageBasicProps = {
  blok: {
    _uid: string;
    body: SbBlokData[];
    isDark?: boolean;
    title?: string;
  };
};

export const SbPageBasic = ({
  blok: { body, isDark },
  blok,
}: SbPageBasicProps) => {
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);
  return (
    <main
      {...storyblokEditable(blok)}
      className={cn('bg-white', isDark && 'dark bg-black text-white')}
    >
      {body &&
        body.map((nestedBlok) => (
          <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
        ))}
    </main>
  );
};
