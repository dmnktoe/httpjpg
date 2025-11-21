"use client";

import { domMax, LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

export interface LazyMotionProviderProps {
  /**
   * Child components
   */
  children: ReactNode;
}

/**
 * LazyMotionProvider - Optimized Framer Motion wrapper
 *
 * Wraps the app with Framer Motion's LazyMotion for reduced bundle size.
 * Uses domMax for full feature set including drag and layout animations.
 *
 * Add this to your root layout or app component.
 *
 * @example
 * ```tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <LazyMotionProvider>
 *           {children}
 *         </LazyMotionProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export const LazyMotionProvider = ({ children }: LazyMotionProviderProps) => {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
};
