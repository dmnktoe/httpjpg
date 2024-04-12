import React from 'react';

import { type TypographyProps, Text } from './Text';
import * as types from './typography.types';

type HeadingProps = Omit<TypographyProps, 'as'> &
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: types.HeadingType;
  };

// Convenience component for paragraphs
export const Heading = ({
  as = 'h2',
  font = 'sans',
  weight = font === 'druk' ? 'black' : 'bold',
  ...rest
}: HeadingProps) => (
  <Text {...rest} font={font} weight={weight} as={as} className='mb-2' />
);
