import {
  type StoryblokRichtext,
  render,
} from 'storyblok-rich-text-react-renderer-ts';

import { cn } from '@/lib/utils';

import { SbText } from '@/components/storyblok/SbText';
import {
  type FontSizeType,
  type TextAlignType,
  Heading,
  Paragraph,
  textAligns,
} from '@/components/ui/Typography';

/**
 * TW classes used in Richtext WYSIWYG to pre-generate
 * -top-04em (used in BlurryPoster)
 */

export type RichTextProps = {
  wysiwyg: StoryblokRichtext;
  // "default" is for main content, e.g., Story body content
  type?: 'default' | 'card';
  textColor?: 'black' | 'white' | 'black-70';
  bgColor?: 'black' | 'black-50' | 'black-60' | 'black-70' | 'white' | 'none';
  textAlign?: TextAlignType;
  className?: string;
};

const textClasses = {
  black: 'text-black',
  white: 'text-white',
  'black-70': 'text-black-70',
};

const bgClasses = {
  black: 'bg-black',
  'black-50': 'bg-black/50',
  'black-60': 'bg-black/60',
  'black-70': 'bg-black/70',
  white: 'bg-white',
  none: '',
};

export const RichText = ({
  wysiwyg,
  type,
  textColor = 'black',
  bgColor = 'none',
  textAlign = 'left',
  className,
}: RichTextProps) => {
  const printColor = 'print:text-black';

  const rendered = render(wysiwyg, {
    markResolvers: {
      styled: (children, props) => (
        <span className={props.class}>{children}</span>
      ),
      bold: (children) => <strong>{children}</strong>,
      italic: (children) => <em>{children}</em>,
    },
    nodeResolvers: {
      heading: (children, props) => {
        const { level } = props;
        /**
         * All heading sizes are type-1 if using the "card" type WYSIWYG
         * For regular main content WYSIWYG, this gets you type-3 for h2, type-2 for h3, type-1 for h4
         * but h5 and h6 would be type-0 (the minimum font size)
         */
        const headingSize = type === 'default' ? Math.max(5 - level, 0) : 1;

        return (
          <Heading
            as={`h${level}`}
            size={headingSize as FontSizeType}
            leading='tight'
          >
            {children}
          </Heading>
        );
      },
      paragraph: (children) => (
        <Paragraph variant={type === 'default' ? 'none' : 'none'}>
          {children}
        </Paragraph>
      ),
    },
    blokResolvers: {
      sbText: (props) => <SbText blok={props} />,
    },
    defaultBlokResolver: (name) => (
      <Paragraph weight='bold' variant={type === 'default' ? 'none' : 'none'}>
        Missing blok resolver for blok type {name}.
      </Paragraph>
    ),
    defaultStringResolver: (str) => <div>{str}</div>,
  });

  return (
    <div
      className={cn(
        'wysiwyg',
        textClasses[textColor],
        bgClasses[bgColor],
        !!bgColor && bgColor !== 'none' ? 'rs-p-2 backdrop-blur-sm' : '',
        printColor,
        textAligns[textAlign],
        className
      )}
    >
      {rendered}
    </div>
  );
};
