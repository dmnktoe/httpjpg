import { storyblokEditable } from '@storyblok/react/rsc';

import { Slideshow } from '@/components/templates/Slideshow/Slideshow';

import { SlideshowStoryblok } from '@/types/component-types-sb';

type SbSlideshowProps = {
  blok: SlideshowStoryblok;
};

const SbSlideshow = ({ blok }: SbSlideshowProps) => (
  <Slideshow images={blok.images} {...storyblokEditable(blok)} />
);

export default SbSlideshow;
