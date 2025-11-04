import { storyblokEditable } from '@storyblok/react';
import { type SbBlokData } from '@storyblok/react/rsc';
import React from 'react';

import { type MarginType, type PaddingType } from '@/data/datasource';

import { Container } from '@/components/layout/Container/Container';

type SbContainerProps = {
  blok: SbBlokData & {
    width?: string;
    py?: PaddingType;
    pt?: PaddingType;
    pb?: PaddingType;
    mt?: MarginType;
    mb?: MarginType;
    my?: MarginType;
    bgColor?: string;
    body?: SbBlokData[];
  };
  className?: string;
  style?: React.CSSProperties;
};

export const SbContainer = React.memo(
  ({ blok, className, style }: SbContainerProps) => {
    const {
      width = 'container',
      py,
      pt,
      pb,
      mt,
      mb,
      my,
      bgColor = 'bg-white',
      body = [],
    } = blok;

    if (!body || !Array.isArray(body)) {
      return null;
    }

    return (
      <Container
        as='section'
        className={className}
        style={style}
        width={width}
        pt={pt}
        pb={pb}
        py={py}
        mt={mt}
        mb={mb}
        my={my}
        bgColor={bgColor}
        {...storyblokEditable(blok)}
      >
        {body.map((nestedBlok) => {
          if (!nestedBlok._uid || !nestedBlok.component) {
            return null;
          }

          return (
            <div key={nestedBlok._uid} data-blok-c='container'>
              {nestedBlok.component === 'container' ? (
                <SbContainer blok={nestedBlok} />
              ) : (
                <div>{nestedBlok.content}</div>
              )}
            </div>
          );
        })}
      </Container>
    );
  }
);
