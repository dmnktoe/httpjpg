"use client";

import { Marquee } from "@httpjpg/ui";
import React, { useEffect, useRef, useState } from "react";

export interface MarqueeTextProps {
  children: string;
  speed?: number;
}

export const MarqueeText = React.memo(({ children, speed = 10 }: MarqueeTextProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const [currentText, setCurrentText] = useState(children);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentText !== children) {
      setCurrentText(children);
      setIsMeasuring(true);
      setShouldAnimate(false);
    }

    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        setShouldAnimate(textWidth > containerWidth);
        setIsMeasuring(false);
      }
    };

    // Delay measurement so layout has settled.
    const timeoutId = setTimeout(checkOverflow, 100);
    window.addEventListener("resize", checkOverflow);
    return () => {
      window.removeEventListener("resize", checkOverflow);
      clearTimeout(timeoutId);
    };
  }, [children, currentText]);

  if (isMeasuring || !shouldAnimate) {
    return (
      <div
        ref={containerRef}
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div ref={textRef}>{children}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        maskImage: "linear-gradient(to right, black 94%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, black 94%, transparent)",
      }}
    >
      <Marquee speed={speed} iosStyle pauseDuration={2}>
        {children}
      </Marquee>
    </div>
  );
});

MarqueeText.displayName = "MarqueeText";
