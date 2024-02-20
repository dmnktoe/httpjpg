'use client'; // Error components must be Client Components

import { useEffect } from 'react';

import { Container } from '@/components/layout/container';
import { Header } from '@/components/layout/header/Header';

export default function Error({
  error,
  // eslint-disable-next-line unused-imports/no-unused-vars
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error('Segment error', error);
  }, [error]);

  return (
    <div className='bg-black'>
      <Header />
      <main>
        <Container width='container' className='rs-my-8 text-white'>
          <h1>Something went wrong.</h1>
          <p>Try refreshing your browser.</p>
        </Container>
      </main>
    </div>
  );
}
