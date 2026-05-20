"use client";

import { domMax, LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

export interface LazyMotionProviderProps {
  children: ReactNode;
}

export const LazyMotionProvider = ({ children }: LazyMotionProviderProps) => (
  <LazyMotion features={domMax} strict>
    {children}
  </LazyMotion>
);
