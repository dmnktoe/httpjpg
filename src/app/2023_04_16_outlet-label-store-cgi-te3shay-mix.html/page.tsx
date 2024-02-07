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
        <h1 className='font-[Times] font-normal lowercase tracking-tight'>
          OUTLET STORE KURFÜRSTEN GALERIE 24.03. — 14.04.2023
        </h1>
        <p className='text-xs'>
          Outlet Label and Outlet Radio have joined forces to become the
          ultimate delivery destination. We're breaking down barriers between
          digital and local shopping by creating a unique showroom that
          represents participating artists and their works, bringing our
          self-produced merchandise to life. We've got everything you need to
          elevate your wardrobe, music and art collection while supporting
          talented artists. Don't miss out on this one-of-a-kind shopping
          experience that combines the best of both worlds.
        </p>
        <p className='text-xs text-neutral-800'>
          Outlet Label and Outlet Radio have joined forces to become the
          ultimate delivery destination. We're breaking down barriers between
          digital and local shopping by creating a unique showroom that
          represents participating artists and their works, bringing our
          self-produced merchandise to life. We've got everything you need to
          elevate your wardrobe, music and art collection while supporting
          talented artists. Don't miss out on this one-of-a-kind shopping
          experience that combines the best of both worlds.
        </p>
        <p className='text-xs text-neutral-600'>
          Outlet Label and Outlet Radio have joined forces to become the
          ultimate delivery destination. We're breaking down barriers between
          digital and local shopping by creating a unique showroom that
          represents participating artists and their works, bringing our
          self-produced merchandise to life. We've got everything you need to
          elevate your wardrobe, music and art collection while supporting
          talented artists. Don't miss out on this one-of-a-kind shopping
          experience that combines the best of both worlds.
        </p>
        <p className='text-xs text-neutral-400'>
          Outlet Label and Outlet Radio have joined forces to become the
          ultimate delivery destination. We're breaking down barriers between
          digital and local shopping by creating a unique showroom that
          represents participating artists and their works, bringing our
          self-produced merchandise to life. We've got everything you need to
          elevate your wardrobe, music and art collection while supporting
          talented artists. Don't miss out on this one-of-a-kind shopping
          experience that combines the best of both worlds.
        </p>
        <p className='text-xs text-neutral-200'>
          Outlet Label and Outlet Radio have joined forces to become the
          ultimate delivery destination. We're breaking down barriers between
          digital and local shopping by creating a unique showroom that
          represents participating artists and their works, bringing our
          self-produced merchandise to life. We've got everything you need to
          elevate your wardrobe, music and art collection while supporting
          talented artists. Don't miss out on this one-of-a-kind shopping
          experience that combines the best of both worlds.
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
