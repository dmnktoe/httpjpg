import { StoryblokComponent, storyblokEditable } from '@storyblok/react/rsc';

import { PageStoryblok } from '@/types/SbComponent.types';

type SbPageProps = {
  blok: PageStoryblok;
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
