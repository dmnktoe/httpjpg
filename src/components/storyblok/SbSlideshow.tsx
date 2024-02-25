import { storyblokEditable } from '@storyblok/react/rsc';

import { Slideshow } from '@/components/templates/Slideshow';

import { SlideshowStoryblok } from '@/types/SbComponent.types';

type SbSlideshowProps = {
  blok: SlideshowStoryblok;
};

const SbSlideshow = ({ blok }: SbSlideshowProps) => (
  <Slideshow images={blok.images} {...storyblokEditable(blok)} />
);

export default SbSlideshow;
