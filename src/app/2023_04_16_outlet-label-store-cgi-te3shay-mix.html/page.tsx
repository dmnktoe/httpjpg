'use client';

import React from 'react';

import UnstyledLink from '@/components/ui/links/UnstyledLink';
import NextImage from '@/components/ui/NextImage';

export default function OutletStorePage() {
  return (
    <div className='flex flex-col gap-2 bg-white'>
      <div>
        <NextImage
          className='left-0 top-0 z-50 -mt-72 w-full'
          width={3000}
          height={2000}
          src='/images/projects/outlet-store/outlet-store_slideshow-1.jpg'
          alt="Outlet Store's slideshow"
        />
      </div>
      <div>
        <p className='text-xs'>
          AA wonderful serenity has taken possession of my entire soul, like
          these sweet mornings of spring which I enjoy with my whole heart. I am
          alone, and feel the charm of existence in this spot, which was created
          for the bliss of souls like mine. I am so happy, my dear friend, so
          absorbed in the exquisite sense of mere tranquil existence, that I
          neglect my talents. I should be incapable of drawing a single stroke
          at the present moment; and yet I feel that I never was a greater
          artist than now. When, while the lovely valley teems with vapour
          around me, and the meridian sun strikes the upper surface of the
          impenetrable foliage of my trees, and but a few stray gleams steal
          into the inner sanctuary, I throw myself down among the tall grass by
          the trickling stream; and, as I lie close to the earth, a thousand
          unknown plants are noticed by me: when I hear the buzz of the little
          world among the stalks, and grow familiar with the countless
          indescribable forms of the insects and flies, then I feel the presence
          of the Almighty, who formed us in his own image, and the breath
        </p>
      </div>
      <div className='text-center'>
        <NextImage
          className='mx-auto w-full xl:w-1/2'
          width={600}
          height={300}
          src='/images/projects/outlet-store/music-set.png'
          alt="Outlet Store's slideshow"
        />
        <UnstyledLink
          className='text-[blue] decoration-dotted'
          href='https://www.dropbox.com/scl/fi/vfzk4tra0ajefkriz9xky/te3k23-final-pak.mp3?rlkey=g59db293n8exsfs1wrmz1l5vu&dl=1'
        >
          ▼ ... DOWNLOAD te3k23 final pak.mp3 ... ▼
        </UnstyledLink>
      </div>
      <div className='p-16'>
        <NextImage
          className='mx-auto w-full xl:w-1/2'
          width={1200}
          height={600}
          src='/images/projects/outlet-store/print.jpeg'
          alt="Outlet Store's slideshow"
        />
      </div>
      <div>
        <NextImage
          className='mt-32 w-full xl:pl-64'
          width={3000}
          height={100}
          src='/images/projects/outlet-store/outlet-store_slideshow-2.jpg'
          alt="Outlet Store's slideshow"
        />
      </div>
    </div>
  );
}
