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
    image: SbImageType;
    alt?: string;
    isLoadingEager?: boolean;
    caption?: StoryblokRichtext;
    aspectRatio?: ImageAspectRatioType;
    isFullHeight?: boolean;
    boundingWidth?: 'container' | 'full';
    width?: WidthType;
    spacingTop?: PaddingType;
    spacingBottom?: PaddingType;
    isCaptionInset?: boolean;
    isCaptionLight?: boolean;
    animation?: AnimationType;
    delay?: number;
  };
};

export const SbImage = ({
  blok: {
    image: { filename, focus } = {},
    alt,
    isLoadingEager,
    caption,
    aspectRatio,
    isFullHeight,
    boundingWidth = 'full',
    width,
    spacingTop,
    spacingBottom,
    isCaptionInset,
    isCaptionLight,
    animation = 'none',
    delay,
  },
  blok,
}: SbImageProps) => {
  const Caption = hasRichText(caption) ? (
    <RichText
      textColor={isCaptionLight ? 'white' : 'black-70'}
      wysiwyg={caption}
    />
  ) : undefined;

  return (
    <Image
      {...storyblokEditable(blok)}
      imageSrc={filename}
      imageFocus={focus}
      alt={alt}
      isLoadingEager={isLoadingEager}
      caption={Caption}
      aspectRatio={aspectRatio}
      isFullHeight={isFullHeight}
      boundingWidth={boundingWidth}
      width={width}
      spacingTop={spacingTop}
      spacingBottom={spacingBottom}
      isCaptionInset={isCaptionInset}
      animation={animation}
      delay={delay}
    />
  );
};
