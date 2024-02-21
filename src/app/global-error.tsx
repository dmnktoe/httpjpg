'use client'; // Error components must be Client Components

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

import { Container } from '@/components/layout/container';
import { Header } from '@/components/layout/header';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className='bg-black'>
      <Header />
      <main>
        <Container width='container' className='rs-my-8 text-white'>
          <h1>Something went very wrong.</h1>
          <p>Try refreshing your browser.</p>
        </Container>
      </main>
    </div>
  );
}
