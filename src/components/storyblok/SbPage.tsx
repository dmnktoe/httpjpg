import {
  SbBlokData,
  StoryblokComponent,
  storyblokEditable,
} from '@storyblok/react/rsc';

type SbPageProps = {
  blok: {
    _uid: string;
    body: SbBlokData[];
  };
};

const SbPage = ({ blok }: SbPageProps) => (
  <main {...storyblokEditable(blok)}>
    {blok.body &&
      blok.body.map((nestedBlok) => (
        <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
  </main>
);

export default SbPage;
