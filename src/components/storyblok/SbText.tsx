import { storyblokEditable } from '@storyblok/react/rsc';

import { type MarginType, type PaddingType } from '@/data/datasource';

import {
  type AnimationType,
  AnimateInView,
} from '@/components/helpers/Animate';
import { WidthBox } from '@/components/layout/WidthBox';
import { Text } from '@/components/ui/Typography';
import {
  type FontFamilyType,
  type FontLeadingType,
  type FontSizeType,
  type FontWeightType,
  type HeadingType,
  type TextAlignType,
  type TextColorType,
  type TextVariantType,
} from '@/components/ui/Typography';

export type SbTextProps = {
  blok: {
    _uid: string;
    text: string;
    color?: TextColorType;
    headingLevel?: HeadingType;
    font?: FontFamilyType;
    size?: FontSizeType;
    variant?: TextVariantType;
    leading?: FontLeadingType;
    align?: TextAlignType;
    weight?: FontWeightType;
    italic?: boolean;
    srOnly?: boolean;
    boundingWidth?: 'container' | 'full';
    width?: '12' | '10' | '8' | '6' | '4';
    marginTop?: MarginType;
    marginBottom?: MarginType;
    paddingTop?: PaddingType;
    paddingBottom?: PaddingType;
    animation?: AnimationType;
    delay?: number;
  };
};

export const SbText = ({
  blok: {
    text,
    color,
    headingLevel,
    font,
    size,
    variant,
    leading,
    align,
    weight,
    italic,
    srOnly,
    boundingWidth,
    marginTop,
    marginBottom,
    paddingTop,
    paddingBottom,
    width,
    animation,
    delay,
  },
  blok,
}: SbTextProps) => (
  <AnimateInView
    {...storyblokEditable(blok)}
    animation={animation}
    delay={delay}
  >
    <WidthBox
      boundingWidth={boundingWidth}
      width={width}
      mt={marginTop}
      mb={marginBottom}
      pt={paddingTop}
      pb={paddingBottom}
    >
      <Text
        as={headingLevel || 'div'}
        font={font}
        color={color}
        size={size}
        variant={variant}
        leading={leading}
        align={align}
        weight={weight}
        italic={italic}
        srOnly={srOnly}
        className='mb-0 whitespace-pre-line'
      >
        {text}
      </Text>
    </WidthBox>
  </AnimateInView>
);
