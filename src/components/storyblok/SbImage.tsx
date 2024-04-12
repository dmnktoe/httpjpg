import { storyblokEditable } from '@storyblok/react/rsc';
import { type StoryblokRichtext } from 'storyblok-rich-text-react-renderer-ts';

import { hasRichText } from '@/lib/hasRichText';

import { type ImageAspectRatioType } from '@/data/datasource';
import { type PaddingType } from '@/data/datasource';

import { type AnimationType } from '@/components/helpers/Animate';
import { RichText } from '@/components/helpers/RichText';
import { type WidthType } from '@/components/layout/WidthBox';
import { Image } from '@/components/ui/Image';

import { type SbImageType } from '@/types/SbFields.types';

type SbImageProps = {
  blok: {
    _uid: string;
    alt?: string;
    animation?: AnimationType;
    aspectRatio?: ImageAspectRatioType;
    boundingWidth?: 'container' | 'full';
    caption?: StoryblokRichtext;
    delay?: number;
    image: SbImageType;
    isCaptionInset?: boolean;
    isCaptionLight?: boolean;
    isFullHeight?: boolean;
    isLoadingEager?: boolean;
    spacingBottom?: PaddingType;
    spacingTop?: PaddingType;
    width?: WidthType;
  };
};

export const SbImage = ({
  blok: {
    alt,
    animation = 'none',
    aspectRatio,
    boundingWidth = 'full',
    caption,
    delay,
    image: { filename, focus } = {},
    isCaptionInset,
    isCaptionLight,
    isFullHeight,
    isLoadingEager,
    spacingBottom,
    spacingTop,
    width,
  },
  blok,
}: SbImageProps) => {
  const Caption =
    caption && hasRichText(caption) ? (
      <RichText
        textColor={isCaptionLight ? 'white' : 'black-70'}
        wysiwyg={caption}
      />
    ) : undefined;

  return (
    <Image
      {...storyblokEditable(blok)}
      alt={alt}
      animation={animation}
      aspectRatio={aspectRatio}
      boundingWidth={boundingWidth}
      caption={Caption}
      delay={delay}
      imageFocus={focus}
      imageSrc={filename || ''}
      isCaptionInset={isCaptionInset}
      isFullHeight={isFullHeight}
      isLoadingEager={isLoadingEager}
      spacingBottom={spacingBottom}
      spacingTop={spacingTop}
      width={width}
    />
  );
};
