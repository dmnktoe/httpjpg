"use client";

import { domMax, LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

export interface LazyMotionProviderProps {
  children: ReactNode;
}

export function LazyMotionProvider({ children }: LazyMotionProviderProps) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}
