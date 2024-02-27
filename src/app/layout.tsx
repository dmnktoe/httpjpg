import { Flexbox } from 'src/components/layout/Flexbox';
import { Header } from 'src/components/layout/Header';

import '@/styles/globals.css';
import 'react-loading-skeleton/dist/skeleton.css';

import GoogleAnalyticsProvider from '@/components/helpers/GoogleAnalyticsProvider';
import LazyMotionProvider from '@/components/helpers/LazyMotionProvider';

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <LazyMotionProvider>
      <html lang='en'>
        <GoogleAnalyticsProvider />
        <body>
          <Header />
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
