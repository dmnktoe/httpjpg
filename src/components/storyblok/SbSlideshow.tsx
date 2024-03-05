import { storyblokEditable } from '@storyblok/react/rsc';

import { Slideshow } from '@/components/templates/Slideshow';

type SbSlideshowProps = {
  blok: {
    _uid: string;
    images: {
      filename: string;
      alt: string;
      focus: string;
    }[];
  };
};

export const SbSlideshow = ({ blok }: SbSlideshowProps) => (
  <Slideshow images={blok.images} {...storyblokEditable(blok)} />
);
