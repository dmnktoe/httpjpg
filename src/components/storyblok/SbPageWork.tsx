import {
  SbBlokData,
  StoryblokComponent,
  storyblokEditable,
} from '@storyblok/react/rsc';
import { useEffect } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer-ts';

import { cn } from '@/lib/utils';

import { SbImageType, SbLinkType } from '@/types/SbFields.types';

export type SbPageWorkProps = {
  blok: {
    _uid: string;
    body: SbBlokData[];
    description?: StoryblokRichtext;
    images?: SbImageType[];
    isDark?: boolean;
    link?: SbLinkType;
    title?: string;
  };
};

export const SbPageWork = ({
  blok: { body, isDark },
  blok,
}: SbPageWorkProps) => {
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
