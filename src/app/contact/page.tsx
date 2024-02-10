'use client';

import React from 'react';

import { Container } from '@/components/layout/container';
import UnstyledLink from '@/components/ui/links/UnstyledLink';

export default function ContactPage() {
  return (
    <main>
      <section>
        <Container className='py-16 leading-10'>
          <UnstyledLink
            className='text-[18vw] text-[pink] blur-sm'
            href='mailto:dmnktoe@gmail.com'
          >
            mail
          </UnstyledLink>
          <br />
          <UnstyledLink
            className='text-[18vw] text-[blue] blur-sm'
            href='https://www.instagram.com/icon.icon.iconn'
          >
            instagram
          </UnstyledLink>
          <br />

          <UnstyledLink
            className='text-[18vw] text-[orange] blur-sm'
            href='mailto:dmnktoe@gmail.com'
          >
            soundcloud
          </UnstyledLink>
        </Container>
      </section>
    </main>
  );
}
