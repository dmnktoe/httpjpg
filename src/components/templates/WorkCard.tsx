import * as React from 'react';

import { AnimateInView } from '@/components/helpers/Animate';
import Slideshow from '@/components/templates/Slideshow';
import UnstyledLink from '@/components/ui/Links/UnstyledLink';

import { SbImageType } from '@/types/SbFields.types';

interface WorkCardProps {
  title: string;
  description: string;
  date: string;
  images: SbImageType[];
  slug: string;
}

export const WorkCard = ({
  title,
  description,
  date,
  images,
  slug,
}: WorkCardProps) => {
  return (
    <div className='flex flex-col gap-2'>
      <div className='xl:mx-0 xl:px-48'>
        {images && images.length > 1 && <Slideshow images={images} />}
      </div>
      <div className='-mt-1'>
        <div className='flex flex-col gap-2 xl:flex-row'>
          <div className='w-full text-[8.5vw] leading-[0.8] tracking-tighter xl:-mt-6 xl:w-1/2 xl:text-[6.5vw]'>
            <AnimateInView animation='fadeIn' delay={0.5}>
              <div className='inline-block'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 32 32'
                  className='relative top-[.8vw] block w-[8vw] rotate-90 xl:w-[6vw]'
                  fill='currentColor'
                >
                  <path d='m26.71 10.29-10-10a1 1 0 0 0-1.41 0l-10 10 1.41 1.41L15 3.41V32h2V3.41l8.29 8.29z' />
                </svg>
              </div>
              {title}
            </AnimateInView>
          </div>
          <div className='font-serif text-xs tracking-tighter xl:w-1/2'>
            <div className='mx-auto w-10/12 xl:w-full'>
              {date && (
                <div className='inline-block w-auto bg-gradient-to-r from-[#e0e0e0] to-[#f7f7f7] p-1 text-xs'>
                  {new Date(date).toLocaleDateString()}
                </div>
              )}
              <br />
              {description}
              <br />
              <br />
              <UnstyledLink
                href={`/work/${slug}`}
                className='hover:text-primary-600 line-clamp-1 text-[blue] hover:underline'
              >
                -̸̨̱̠̳̩̼͙̈̀̀̄̃̆́͠ͅ↳↳↳{slug}↳↳↳
              </UnstyledLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
