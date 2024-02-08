// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { StoryblokComponent, storyblokEditable } from '@storyblok/react/rsc';
import { Key } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Page = ({ blok }) => (
  <main {...storyblokEditable(blok)}>
    {blok.body.map((nestedBlok: { _uid: Key | null | undefined }) => (
      <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
    ))}
  </main>
);

export default Page;
