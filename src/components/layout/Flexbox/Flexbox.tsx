import React, { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

import * as styles from './Flexbox.styles';
import * as types from './Flexbox.types';

type FlexboxProps = HTMLAttributes<HTMLElement> & {
  as?: types.FlexElementType;
  direction?: types.FlexDirectionType;
  wrap?: types.FlexWrapType;
  gap?: boolean;
  justifyContent?: types.FlexJustifyContentType;
  alignContent?: types.FlexAlignContentType;
  alignItems?: types.FlexAlignItemsType;
  children?: ReactNode;
};

export const Flexbox = ({
  as: AsComponent = 'div',
  direction,
  gap,
  wrap,
  justifyContent,
  alignContent,
  alignItems,
  children,
  className,
  ...props
}: FlexboxProps) => (
  <AsComponent
    {...props}
    className={cn(
      'flex',
      direction ? styles.flexDirection[direction] : '',
      wrap ? styles.flexWrap[wrap] : '',
      justifyContent ? styles.flexJustifyContent[justifyContent] : '',
      alignContent ? styles.flexAlignContent[alignContent] : '',
      alignItems ? styles.flexAlignItems[alignItems] : '',
      gap ? 'gap-4' : '',
      className
    )}
  >
    {children}
  </AsComponent>
);
