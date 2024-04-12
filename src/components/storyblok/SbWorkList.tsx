import { storyblokEditable } from '@storyblok/react/rsc';
import React from 'react';

import { SbPageWorkProps } from '@/components/storyblok/SbPageWork';
import { WorkCard } from '@/components/templates/WorkCard';
import { Divider } from '@/components/ui/Divider';

type SbWorkListProps = {
  blok: {
    _uid: string;
    work?: {
      name: string;
      slug: string;
      created_at: string;
      content?: SbPageWorkProps['blok'];
    }[];
  };
};

export const SbWorkList = ({ blok }: SbWorkListProps) => {
  return (
    <div {...storyblokEditable(blok)}>
      {blok.work &&
        blok.work.map((work) => (
          <React.Fragment key={blok._uid}>
            <div className='pb-24 xl:pb-48'>
              <WorkCard
                date={work.created_at}
                slug={work.slug}
                // Use the work content title if it exists,
                // otherwise use the work name.
                title={work.content?.title || work.name}
                description={work.content?.description}
                images={work.content?.images || []}
              />
            </div>
            <Divider className='pb-24 xl:pb-48' />
          </React.Fragment>
        ))}
    </div>
  );
};
