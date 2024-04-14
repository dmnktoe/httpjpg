'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Flexbox } from '@/components/layout/Flexbox';
import { Footer } from '@/components/layout/Footer/Footer';
import { Header } from '@/components/layout/Header';

type LayoutProviderProps = {
  children: React.ReactNode;
  // TODO: Add type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
};

export const LayoutProvider = ({ children, props }: LayoutProviderProps) => {
  const [height, setHeight] = useState(0);
  const ref = useRef(null);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const updateHeight = () => setHeight(ref.current?.clientHeight);

  useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <>
      <div
        ref={ref}
        className='pointer-events-none z-50 w-full md:sticky md:top-0'
      >
        <Header data={props.header} />
      </div>
      <Flexbox
        justifyContent='between'
        direction='col'
        style={{ minHeight: `calc(100vh - ${height - 1}px)` }}
      >
        {children}
      </Flexbox>
      <Footer />
    </>
  );
};
