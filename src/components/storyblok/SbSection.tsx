'use client';

import { type SbBlokData, storyblokEditable } from '@storyblok/react/rsc';

import { type MarginType, type PaddingType } from '@/data/datasource';

import { CreateBloks } from '@/components/helpers/CreateBloks';
import { type BgColorType, Container } from '@/components/layout/Container';

type SbSectionProps = {
  blok: {
    _uid: string;
    content: SbBlokData[];
    bgColor?: BgColorType;
    paddingTop?: PaddingType;
    paddingBottom?: PaddingType;
    marginTop?: MarginType;
    marginBottom?: MarginType;
    width?: 'container' | 'full';
  };
};

export const SbSection = ({
  blok: {
    content,
    bgColor,
    paddingTop,
    paddingBottom,
    marginTop,
    marginBottom,
    width,
  },
  blok,
}: SbSectionProps) => {
  return (
    <Container
      width={width}
      mt={marginTop}
      mb={marginBottom}
      bgColor={bgColor}
      pt={paddingTop}
      pb={paddingBottom}
      {...storyblokEditable(blok)}
    >
      <CreateBloks blokSection={content} />
    </Container>
  );
};
