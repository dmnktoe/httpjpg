import {
  SbBlokData,
  StoryblokComponent,
  storyblokEditable,
} from '@storyblok/react/rsc';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer-ts';

import { RichText } from '@/components/helpers/RichText';
import { Container } from '@/components/layout/Container';
import UnstyledLink from '@/components/ui/Links/UnstyledLink';

import { SbImageType, SbLinkType } from '@/types/SbFields.types';

type SbPageWorkProps = {
  blok: {
    _uid: string;
    body: SbBlokData[];
    description?: StoryblokRichtext;
    images?: SbImageType[];
    link?: SbLinkType;
    title?: string;
  };
};

export const SbPageWork = ({
  blok: { body, description, images, link, title },
  blok,
}: SbPageWorkProps) => (
  <main {...storyblokEditable(blok)}>
    <Container>
      {title && <h1 className='mb-3'>{title}</h1>}
      {description && <RichText wysiwyg={description} />}
      {link && (
        <UnstyledLink href={link.cached_url} target={link.cached_url}>
          {link.title}
        </UnstyledLink>
      )}
      {body &&
        body.map((nestedBlok) => (
          <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
        ))}
      {images && (
        <div>
          {images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.filename}
              src={image.filename}
              alt={image.alt || ''}
            />
          ))}
        </div>
      )}
    </Container>
  </main>
);
