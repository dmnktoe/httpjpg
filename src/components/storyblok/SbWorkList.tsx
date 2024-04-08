import { storyblokEditable } from '@storyblok/react/rsc';
import React from 'react';

import { WorkCard } from '@/components/templates/WorkCard';

import { SbImageType } from '@/types/SbFields.types';

type SbWorkListProps = {
  blok: {
    _uid: string;
    work?: {
      name: string;
      slug: string;
      created_at: string;
      content?: {
        _uid: string;
        title: string;
        description: string;
        images: SbImageType[];
      };
    }[];
  };
};

export const SbWorkList = ({ blok }: SbWorkListProps) => {
  return (
    <main {...storyblokEditable(blok)}>
      {blok.work &&
        blok.work.map((work) => (
          <>
            <div className='pb-24 xl:pb-48' key={blok._uid}>
              <WorkCard
                date={work.created_at}
                slug={work.slug}
                // Use the work content title if it exists,
                // otherwise use the work name.
                title={work.content?.title || work.name}
                description={work.content?.description || ''}
                images={work.content?.images || []}
              />
            </div>
            <div className='pb-24 text-center xl:pb-48'>*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚</div>
          </>
        ))}
    </main>
  );
};
