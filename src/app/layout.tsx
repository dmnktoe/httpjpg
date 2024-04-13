import React from 'react';

import '@/styles/globals.css';

import GoogleAnalyticsProvider from '@/components/helpers/GoogleAnalyticsProvider';
import { LayoutProvider } from '@/components/helpers/LayoutProvider';
import LazyMotionProvider from '@/components/helpers/LazyMotionProvider';

import { getHeaderData } from '@/app/page';

type LayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: LayoutProps) {
  const { props } = await getHeaderData();
  return (
    <LazyMotionProvider>
      <html lang='en'>
        <GoogleAnalyticsProvider />
        <body>
          <LayoutProvider props={props}>{children}</LayoutProvider>
        </body>
      </html>
    </LazyMotionProvider>
  );
}
