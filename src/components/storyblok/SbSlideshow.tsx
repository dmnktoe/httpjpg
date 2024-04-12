import { storyblokEditable } from '@storyblok/react/rsc';

import type { ImageAspectRatioType, PaddingType } from '@/data/datasource';

import type { AnimationType } from '@/components/helpers/Animate';
import type { WidthType } from '@/components/layout/WidthBox';
import { Slideshow } from '@/components/templates/Slideshow';

import { SbImageType } from '@/types/SbFields.types';

type SbSlideshowProps = {
  blok: {
    _uid: string;
    animation?: AnimationType;
    aspectRatio?: ImageAspectRatioType;
    boundingWidth?: 'container' | 'full';
    delay?: number;
    images: SbImageType[];
    spacingBottom?: PaddingType;
    spacingTop?: PaddingType;
    speed?: number;
    width?: WidthType;
  };
};

export const SbSlideshow = ({
  blok: {
    animation = 'none',
    aspectRatio = '16x9',
    boundingWidth = 'full',
    delay,
    images,
    spacingBottom,
    spacingTop,
    speed = 1,
    width,
  },
  blok,
}: SbSlideshowProps) => (
  <Slideshow
    {...storyblokEditable(blok)}
    animation={animation}
    aspectRatio={aspectRatio}
    boundingWidth={boundingWidth}
    delay={delay}
    images={images}
    spacingBottom={spacingBottom}
    spacingTop={spacingTop}
    speed={speed}
    width={width}
  />
);
