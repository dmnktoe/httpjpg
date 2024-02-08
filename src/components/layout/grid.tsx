// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { StoryblokComponent, storyblokEditable } from '@storyblok/react/rsc';
import { Key } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Grid = ({ blok }) => {
  return (
    <div {...storyblokEditable(blok)}>
      {blok.columns.map((nestedBlok: { _uid: Key | null | undefined }) => (
        <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </div>
  );
};

export default Grid;
