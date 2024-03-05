import React from 'react';

import { getProcessedImage } from '@/lib/getProcessedImage';
import { getSbImageSize } from '@/lib/getSbImageSize';
import { cn } from '@/lib/utils';

import { type PaddingType } from '@/data/datasource';
import {
  type ImageAspectRatioType,
  imageAspectRatios,
} from '@/data/datasource';

import { AnimateInView } from '@/components/helpers/Animate';
import { type AnimationType } from '@/components/helpers/Animate';
import { Container } from '@/components/layout/Container';
import { type WidthType, WidthBox } from '@/components/layout/WidthBox';

import * as styles from './Image.styles';

type ImageProps = React.HTMLAttributes<HTMLDivElement> & {
  imageSrc: string;
  imageFocus?: string;
  isLoadingEager?: boolean;
  alt?: string;
  caption?: React.ReactNode;
  aspectRatio?: ImageAspectRatioType;
  isFullHeight?: boolean;
  boundingWidth?: 'container' | 'full';
  width?: WidthType;
  spacingTop?: PaddingType;
  spacingBottom?: PaddingType;
  isCaptionInset?: boolean;
  animation?: AnimationType;
  delay?: number;
};

export const Image = ({
  imageSrc,
  imageFocus,
  isLoadingEager,
  alt,
  caption,
  aspectRatio,
  isFullHeight,
  boundingWidth = 'full',
  width,
  spacingTop,
  spacingBottom,
  isCaptionInset,
  animation = 'none',
  delay,
  className,
  ...props
}: ImageProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { width: originalWidth, height: originalHeight } =
    getSbImageSize(imageSrc);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const cropSize = styles.imageCrops[aspectRatio];
  /**
   * Crop width and height are used for width and height attributes on the img element.
   * They don't need to be exact as long as the aspect ratio is correct.
   */
  const cropWidth = parseInt(cropSize?.split('x')[0], 10);
  const cropHeight =
    aspectRatio === 'free'
      ? Math.round((originalHeight * 2000) / originalWidth)
      : parseInt(cropSize?.split('x')[1], 10);

  return (
    <WidthBox
      {...props}
      boundingWidth={boundingWidth}
      width={width}
      pt={spacingTop}
      pb={spacingBottom}
      className={cn(className, styles.root(isFullHeight))}
    >
      <AnimateInView
        animation={animation}
        delay={delay}
        className={styles.animateWrapper(isFullHeight)}
      >
        <figure className={styles.figure(isFullHeight)}>
          <div
            className={cn(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              imageAspectRatios[aspectRatio],
              styles.imageWrapper(isFullHeight)
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getProcessedImage(imageSrc, cropSize, imageFocus)}
              loading={isLoadingEager ? 'eager' : 'lazy'}
              width={cropWidth}
              height={cropHeight}
              alt={alt || ''}
              className={styles.image}
            />
          </div>
          {caption && (
            <Container
              as='figcaption'
              width={isCaptionInset ? 'container' : 'full'}
            >
              <div className={styles.caption}>{caption}</div>
            </Container>
          )}
        </figure>
      </AnimateInView>
    </WidthBox>
  );
};
