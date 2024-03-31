import { storyblokEditable } from '@storyblok/react/rsc';
import React from 'react';

import { WorkCard } from '@/components/templates/WorkCard';

import { Work } from '@/types/Work.types';

type SbWorkListProps = {
  blok: {
    _uid: string;
    work: Work[];
  };
};

export const SbWorkList = ({ blok }: SbWorkListProps) => {
  return (
    <main {...storyblokEditable(blok)}>
      {blok.work &&
        blok.work.map((work) => <WorkCard work={work} key={work.id} />)}
    </main>
  );
};
