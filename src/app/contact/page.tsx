'use client';

import React from 'react';

import { Container } from '@/components/layout/container';
import UnstyledLink from '@/components/ui/links/UnstyledLink';

export default function ContactPage() {
  return (
    <main>
      <section>
        <Container className='py-16'>
          <UnstyledLink href='https://www.instagram.com/icon.icon.iconn'>
            instagram
          </UnstyledLink>
          <br />
          <div className='mix-blend-difference'>
            <UnstyledLink href='mailto:dmnktoe@gmail.com'>mail</UnstyledLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
