import {
  SbBlokData,
  StoryblokComponent,
  storyblokEditable,
} from '@storyblok/react/rsc';

type SbWorkProps = {
  blok: {
    _uid: string;
    body: SbBlokData[];
  };
};

export const SbWork = ({ blok }: SbWorkProps) => (
  <main {...storyblokEditable(blok)}>
    {blok.body &&
      blok.body.map((nestedBlok) => (
        <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
  </main>
);
