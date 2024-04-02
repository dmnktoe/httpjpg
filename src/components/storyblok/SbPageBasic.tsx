import {
  SbBlokData,
  StoryblokComponent,
  storyblokEditable,
} from '@storyblok/react/rsc';

type SbPageBasicProps = {
  blok: {
    _uid: string;
    body: SbBlokData[];
  };
};

export const SbPageBasic = ({ blok }: SbPageBasicProps) => (
  <main {...storyblokEditable(blok)}>
    {blok.body &&
      blok.body.map((nestedBlok) => (
        <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
  </main>
);
