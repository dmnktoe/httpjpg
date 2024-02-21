'use client';
import { domAnimation, LazyMotion } from 'framer-motion';
import React from 'react';

interface LazyMotionProviderProps {
  children: React.ReactNode;
}
const LazyMotionProvider = ({ children }: LazyMotionProviderProps) => {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
};

export default LazyMotionProvider;
