import { cn } from '@/lib/utils';

import { type TypographyProps, Text } from './Text';

type ParagraphProps = Omit<TypographyProps, 'className'> &
  React.HTMLAttributes<HTMLParagraphElement> & {
    noMargin?: boolean; // If true, remove the bottom margin from base styles
  };

// Convenience component for paragraphs
export const Paragraph = ({ noMargin, className, ...rest }: ParagraphProps) => (
  <Text {...rest} as='p' className={cn(noMargin ? 'mb-0' : '', className)} />
);
