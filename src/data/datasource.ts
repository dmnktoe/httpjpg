export const imageAspectRatios = {
  '1x1': 'aspect-w-1 aspect-h-1',
  '1x2': 'aspect-w-1 aspect-h-2',
  '2x1': 'aspect-w-2 aspect-h-1',
  '2x3': 'aspect-w-2 aspect-h-3',
  '3x2': 'aspect-w-3 aspect-h-2',
  '3x4': 'aspect-w-3 aspect-h-4',
  '4x3': 'aspect-w-4 aspect-h-3',
  '5x8': 'aspect-w-5 aspect-h-8',
  '8x5': 'aspect-w-8 aspect-h-5',
  '9x16': 'aspect-w-9 aspect-h-16',
  '16x9': 'aspect-w-16 aspect-h-9',
  free: '',
};
export type ImageAspectRatioType = keyof typeof imageAspectRatios;

export const mediaAspectRatios = {
  '1x1': 'aspect-w-1 aspect-h-1',
  '1x2': 'aspect-w-1 aspect-h-2',
  '2x1': 'aspect-w-2 aspect-h-1',
  '2x3': 'aspect-w-2 aspect-h-3',
  '3x2': 'aspect-w-3 aspect-h-2',
  '3x4': 'aspect-w-3 aspect-h-4',
  '4x3': 'aspect-w-4 aspect-h-3',
  '5x8': 'aspect-w-5 aspect-h-8',
  '8x5': 'aspect-w-8 aspect-h-5',
  '9x16': 'aspect-w-9 aspect-h-16',
  '16x9': 'aspect-w-16 aspect-h-9',
  free: '',
};
export type MediaAspectRatioType = keyof typeof mediaAspectRatios;

export const paddingTops = {
  none: '',
  base: 'pt-0',
  xs: 'pt-1',
  sm: 'pt-2',
  md: 'pt-4',
  lg: 'pt-8',
  xl: 'pt-16',
  '2xl': 'pt-32',
  '3xl': 'pt-48',
  '4xl': 'pt-64',
  '5xl': 'pt-80',
};

export const paddingBottoms = {
  none: '',
  base: 'pb-0',
  xs: 'pb-1',
  sm: 'pb-2',
  md: 'pb-4',
  lg: 'pb-8',
  xl: 'pb-16',
  '2xl': 'pb-32',
  '3xl': 'pb-48',
  '4xl': 'pb-64',
  '5xl': 'pb-80',
};

export const paddingVerticals = {
  none: '',
  base: 'py-0',
  xs: 'py-1',
  sm: 'py-2',
  md: 'py-4',
  lg: 'py-8',
  xl: 'py-16',
  '2xl': 'py-32',
  '3xl': 'py-48',
  '4xl': 'py-64',
  '5xl': 'py-80',
};
export type PaddingType = keyof typeof paddingTops;

export const marginVerticals = {
  none: '',
  base: 'my-0',
  xs: 'my-1',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-8',
  xl: 'my-16',
  '2xl': 'my-32',
  '3xl': 'my-48',
  '4xl': 'my-64',
  '5xl': 'my-80',
};

export const marginTops = {
  none: '',
  base: 'mt-0',
  xs: 'mt-1',
  sm: 'mt-2',
  md: 'mt-4',
  lg: 'mt-8',
  xl: 'mt-16',
  '2xl': 'mt-32',
  '3xl': 'mt-48',
  '4xl': 'mt-64',
  '5xl': 'mt-80',
};

export const marginBottoms = {
  none: '',
  base: 'mb-0',
  xs: 'mb-1',
  sm: 'mb-2',
  md: 'mb-4',
  lg: 'mb-8',
  xl: 'mb-16',
  '2xl': 'mb-32',
  '3xl': 'mb-48',
  '4xl': 'mb-64',
  '5xl': 'mb-80',
};
export type MarginType = keyof typeof marginBottoms;
