import * as React from 'react';

import Slideshow from '@/components/templates/Slideshow';
import UnstyledLink from '@/components/ui/Links/UnstyledLink';

import { Work } from '@/types/Work.types';

export const WorkCard = ({ work }: { work: Work }) => {
  return (
    <div className='flex flex-col gap-2'>
      <div className='-mx-2 md:mx-0 xl:px-48'>
        {work.content.images && work.content.images.length > 1 && (
          <Slideshow images={work.content.images} />
        )}
      </div>
      <div>
        <div className='flex flex-col gap-2 xl:flex-row'>
          <div className='w-full overflow-hidden rounded-full border-[1px] border-solid border-black bg-[url("/images/glitter.gif")] bg-cover text-[8.5vw] leading-[0.8] tracking-tighter xl:w-1/2 xl:text-[6.5vw]'>
            <div className='inline-block'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 32 32'
                className='w-[6vw] rotate-90 xl:w-[5vw]'
                fill='currentColor'
              >
                <path d='m26.71 10.29-10-10a1 1 0 0 0-1.41 0l-10 10 1.41 1.41L15 3.41V32h2V3.41l8.29 8.29z' />
              </svg>
            </div>
            {work.name}
          </div>
          <div className='project-desc h-auto w-full rounded-[10vw] border-[1px] border-solid border-black bg-white/70 p-1 text-xs tracking-tighter text-black xl:w-1/2 xl:rounded-full xl:p-6'>
            <div className='mx-auto w-10/12'>
              {/* format date */}
              {work.created_at && (
                <div className='w-auto rounded-2xl bg-pink-300 p-2'>
                  {new Date(work.created_at).toLocaleDateString()}
                </div>
              )}
              <br />
              {work.content.description}
              <br />
              <br />
              <UnstyledLink
                href={`/work/${work.slug}`}
                className='hover:text-primary-600 line-clamp-1 text-[blue] hover:underline'
              >
                -̸̨̱̠̳̩̼͙̈̀̀̄̃̆́͠ͅ↳↳↳{work.slug}↳↳↳
              </UnstyledLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
