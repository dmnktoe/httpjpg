"use client";

import { domAnimation, LazyMotion } from "framer-motion";
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
 * Only loads DOM animations (no SVG/3D features).
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
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
};
