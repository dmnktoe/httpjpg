'use client';

import React from 'react';

import NextImage from '@/components/ui/NextImage';

export default function OutletStorePage() {
  return (
    <div className='darkPage flex flex-col gap-24 !bg-black'>
      <div>
        <NextImage
          className='left-0 top-0 z-50 w-full'
          width={3000}
          height={2000}
          src='/images/projects/blence/blence_slideshow-1.jpg'
          alt="Outlet Store's slideshow"
        />
      </div>
      <div>
        <h1 className='relative block text-center text-[21vw] font-normal lowercase tracking-tight text-[red]'>
          BLENCE2k23
        </h1>
      </div>
      <p className='relative block h-auto px-4 text-xs text-neutral-200'>
        Outlet Label and Outlet Radio have joined forces to become the ultimate
        delivery destination. We're breaking down barriers between digital and
        local shopping by creating a unique showroom that represents
        participating artists and their works, bringing our self-produced
        merchandise to life. We've got everything you need to elevate your
        wardrobe, music and art collection while supporting talented artists.
        Don't miss out on this one-of-a-kind shopping experience that combines
        the best of both worlds.
      </p>
      <div className='w-full'>
        <NextImage
          className='w-full'
          width={3000}
          height={2000}
          src='/images/projects/blence/blence_slideshow-3.jpg'
          alt="Outlet Store's slideshow"
        />
      </div>
      <div className='w-full'>
        <NextImage
          className='w-full px-64'
          width={3000}
          height={2000}
          src='/images/projects/blence/blence_slideshow-4.jpg'
          alt="Outlet Store's slideshow"
        />
      </div>
      <div className='w-full'>
        <NextImage
          className='w-full px-64'
          width={3000}
          height={2000}
          src='/images/projects/blence/blence_slideshow-5.jpg'
          alt="Outlet Store's slideshow"
        />
      </div>
    </div>
  );
}
