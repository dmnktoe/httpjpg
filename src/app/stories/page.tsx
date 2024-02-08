'use client';

import Image from 'next/image';
import React from 'react';

// import { StlViewer } from 'react-stl-viewer';
import { Container } from '@/components/layout/container';
import NextImage from '@/components/ui/NextImage';

// const url = '/images/stories/star.stl';

// const style = {
//   width: '100%',
//   height: '400px',
// };

export default function StoriesPage() {
  return (
    <main className='bg-white'>
      <section>
        <Container>
          <div className='grid grid-cols-6 grid-rows-5 gap-4'>
            <div className='col-span-6 row-span-1 md:col-span-2 md:row-span-5'>
              <div className='text-xs'>
                The form International Issue was a project close to our hearts.
                Nina Sieverding and I wanted to make the diverse content from
                the German form magazine accessible to a wider audience.
                Together with Autostrada Studio, we developed a graphical book
                concept in the form of a portable archive featuring 35
                contributions from recent years.Besides that, I was responsible
                for its financing and marketing.
                {/* <StlViewer style={style} orbitControls shadows url={url} /> */}
              </div>
            </div>
            <div className='col-span-3 col-start-1 row-span-4 md:col-span-2 md:col-start-3 md:row-span-5'>
              <Image
                width='800'
                height='800'
                alt='test'
                className='w-full'
                src='/images/stories/hospital.jpg'
              />
            </div>
            <div className='col-span-3 col-start-4 row-span-4 md:col-span-2 md:col-start-5 md:row-span-5'>
              <NextImage
                width='800'
                height='800'
                alt='test'
                className='aspect-auto w-full'
                src='/images/stories/knockout.webp'
                useSkeleton
              />
            </div>
          </div>
        </Container>
        <div className='relative px-44 pt-96'>
          <div className='flex gap-4'>
            <div className='w-1/2'>
              <Image
                alt='test'
                className='w-full'
                src='/images/stories/knockout.webp'
                width={780}
                height={1040}
              />
              <Image
                alt='test'
                className='absolute bottom-0 right-64 w-[40vw]'
                src='/images/stories/knockout.webp'
                width={780}
                height={1040}
              />
            </div>
            <div className='w-1/2'>
              <div className='text-xs'>
                The form International Issue was a project close to our hearts.
                Nina Sieverding and I wanted to make the diverse content from
                the German form magazine accessible to a wider audience.
                Together with Autostrada Studio, we developed a graphical book
                concept in the form of a portable archive featuring 35
                contributions from recent years.Besides that, I was responsible
                for its financing and marketing.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
