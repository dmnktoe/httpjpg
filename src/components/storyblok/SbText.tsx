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
    align?: TextAlignType;
    animation?: AnimationType;
    boundingWidth?: 'container' | 'full';
    color?: TextColorType;
    delay?: number;
    font?: FontFamilyType;
    headingLevel?: HeadingType;
    italic?: boolean;
    leading?: FontLeadingType;
    marginBottom?: MarginType;
    marginTop?: MarginType;
    paddingBottom?: PaddingType;
    paddingTop?: PaddingType;
    size?: FontSizeType;
    srOnly?: boolean;
    text: string;
    variant?: TextVariantType;
    weight?: FontWeightType;
    width?: '12' | '10' | '8' | '6' | '4';
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
