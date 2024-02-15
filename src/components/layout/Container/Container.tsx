import React, { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

import {
  marginBottoms,
  marginTops,
  MarginType,
  marginVerticals,
  paddingBottoms,
  paddingTops,
  PaddingType,
  paddingVerticals,
} from '@/constant/datasource';

import * as styles from './Container.styles';
import * as types from './Container.types';

export type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: types.ContainerElementType;
  width?: types.WidthType;
  pt?: PaddingType;
  pb?: PaddingType;
  py?: PaddingType;
  mt?: MarginType;
  mb?: MarginType;
  my?: MarginType;
  bgColor?: types.BgColorType;
  style?: React.CSSProperties;
};

export const Container = ({
  as: AsComponent = 'div',
  width = 'container',
  py,
  pt,
  pb,
  mt,
  mb,
  my,
  bgColor,
  style,
  className,
  children,
  ...props
}: ContainerProps) => (
  <AsComponent
    {...props}
    style={style}
    className={cn(
      bgColor ? styles.bgColors[bgColor] : '',
      py ? paddingVerticals[py] : '',
      pt ? paddingTops[pt] : '',
      pb ? paddingBottoms[pb] : '',
      my ? marginVerticals[my] : '',
      mt ? marginTops[mt] : '',
      mb ? marginBottoms[mb] : '',
      width ? styles.widths[width] : '',
      className
    )}
  >
    {children}
  </AsComponent>
);
