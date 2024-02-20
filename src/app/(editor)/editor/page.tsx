'use client';

import React from 'react';

import { Container } from '@/components/layout/container/Container';
import UnstyledLink from '@/components/ui/links/UnstyledLink';
import NextImage from '@/components/ui/NextImage';

export default function ContactPage() {
  return (
    <main>
      <section>
        <Container className='py-16 leading-10'>
          <UnstyledLink
            className='text-[20vw] text-[blue] blur-sm'
            href='https://www.instagram.com/icon.icon.iconn'
          >
            instagram
          </UnstyledLink>
          <br />
          <UnstyledLink
            className='text-[20vw] text-[pink] blur-sm'
            href='mailto:dmnktoe@gmail.com'
          >
            mail
          </UnstyledLink>
          <UnstyledLink
            className='text-[20vw] text-[pink]'
            href='https://soundcloud.com/te3shay'
          >
            <NextImage
              useSkeleton
              width={400}
              height={200}
              src='/images/desktop.jpeg'
              alt='contact'
            />
          </UnstyledLink>
        </Container>
      </section>
    </main>
  );
}
