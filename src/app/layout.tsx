import React from 'react';

import '@/styles/globals.css';
import 'react-loading-skeleton/dist/skeleton.css';

import GoogleAnalyticsProvider from '@/components/helpers/GoogleAnalyticsProvider';
import LazyMotionProvider from '@/components/helpers/LazyMotionProvider';
import { Flexbox } from '@/components/layout/Flexbox';
import { Header } from '@/components/layout/Header';

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
          <Header data={props.header} />
          <Flexbox
            justifyContent='between'
            direction='col'
            className='relative'
          >
            {children}
          </Flexbox>
        </body>
      </html>
    </LazyMotionProvider>
  );
}
