import {
  SbBlokData,
  StoryblokComponent,
  storyblokEditable,
} from '@storyblok/react/rsc';

import { SbImageType } from '@/types/SbFields.types';

type SbPageWorkProps = {
  name: string;
  blok: {
    _uid: string;
    title?: string;
    description?: string;
    link?: string;
    type?: 'work' | 'project';
    images?: SbImageType[];
    body: SbBlokData[];
  };
};

export const SbPageWork = ({ blok }: SbPageWorkProps) => (
  <main {...storyblokEditable(blok)}>
    {blok.body &&
      blok.body.map((nestedBlok) => (
        <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    {blok.images && (
      <div>
        {blok.images.map((image) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={image.filename}
            src={image.filename}
            alt={image.alt || ''}
          />
        ))}
      </div>
    )}
  </main>
);
