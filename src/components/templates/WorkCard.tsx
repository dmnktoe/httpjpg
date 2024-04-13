import * as React from 'react';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer-ts';

import { hasRichText } from '@/lib/hasRichText';

import { AnimateInView } from '@/components/helpers/Animate';
import { RichText } from '@/components/helpers/RichText';
import Slideshow from '@/components/templates/Slideshow';
import UnstyledLink from '@/components/ui/Links/UnstyledLink';

import { SbImageType } from '@/types/SbFields.types';

interface WorkCardProps {
  title: string;
  description?: StoryblokRichtext;
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
  const Description =
    description && hasRichText(description) ? (
      <RichText wysiwyg={description} />
    ) : undefined;
  return (
    <div className='flex flex-col gap-2'>
      <div className='z-10 xl:mx-0 xl:px-48 2xl:px-64'>
        <Slideshow animation='sharpen' images={images} />
      </div>
      <div className='z-10'>
        <div className='flex flex-col gap-2 xl:flex-row 2xl:px-48'>
          <div className='-mt-3 w-full text-[8.5vw] leading-[0.8] tracking-tighter md:-mt-6 xl:-mt-[5vw] xl:w-1/2 xl:text-[6vw] 2xl:-ml-6 2xl:mr-6'>
            <AnimateInView animation='fadeIn' delay={0.5}>
              <div className='inline-block'>
                <Arrow />
              </div>
              {title}
            </AnimateInView>
          </div>
          <div className='xl:w-1/2'>
            <div className='mx-auto flex flex-col gap-4 md:w-10/12 xl:w-full'>
              <div className='line-clamp-5 xl:line-clamp-none'>
                {Description}
              </div>
              <div>
                {date && (
                  <div className='inline-block w-auto font-mono line-through'>
                    {new Date(date).toLocaleDateString('de-DE', {
                      year: '2-digit',
                      month: 'narrow',
                      day: '2-digit',
                    })}
                    ꠹ρᧁׁׅt
                  </div>
                )}
                <div>
                  <UnstyledLink
                    href={`/work/${slug}`}
                    className=' line-clamp-1 text-[blue] hover:underline'
                  >
                    -̸̨̱̠̳̩̼͙̈̀̀̄̃̆́͠ͅ↳↳↳{slug}↳↳↳
                  </UnstyledLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Arrow = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 32 32'
    className='relative top-[.8vw] block w-[8vw] rotate-90 xl:w-[6vw]'
    fill='currentColor'
  >
    <path d='m26.71 10.29-10-10a1 1 0 0 0-1.41 0l-10 10 1.41 1.41L15 3.41V32h2V3.41l8.29 8.29z' />
  </svg>
);
