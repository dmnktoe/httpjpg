import { type SbBlokData, StoryblokComponent } from '@storyblok/react/rsc';
import React from 'react';

type CreateBloksProps = {
  blokSection: SbBlokData[];
  isListItems?: boolean;
  [k: string]: unknown;
};

export const CreateBloks: React.FC<CreateBloksProps> = ({
  blokSection,
  isListItems,
  ...props
}) => {
  if (blokSection && isListItems) {
    return (
      <ul>
        {blokSection.map((blok) => (
          <li key={blok._uid}>
            <StoryblokComponent blok={blok} {...props} />
          </li>
        ))}
      </ul>
    );
  } else if (blokSection) {
    return (
      <>
        {blokSection.map((blok) => (
          <StoryblokComponent key={blok._uid} blok={blok} {...props} />
        ))}
      </>
    );
  }

  // Return null if no content provided.
  return null;
};
