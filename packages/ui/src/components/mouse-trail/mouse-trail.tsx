"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface MouseTrailProps {
  character?: string;
  count?: number;
  lifetime?: number;
  size?: string;
  color?: string;
  css?: SystemStyleObject;
}

interface TrailParticle {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

export function MouseTrail({
  character = "✦",
  count = 20,
  lifetime = 1000,
  size = "24px",
  color = "var(--colors-page-fg)",
  css: cssProp,
}: MouseTrailProps) {
  const [particles, setParticles] = useState<TrailParticle[]>([]);
  const particleIdRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let rafId: number;
    let lastTime = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();

      if (now - lastTime < 30) {
        return;
      }
      lastTime = now;

      setParticles((prev) => {
        particleIdRef.current += 1;
        const uniqueId = `${particleIdRef.current}-${now}`;

        const newParticle: TrailParticle = {
          id: uniqueId,
          x: e.clientX,
          y: e.clientY,
          timestamp: now,
        };

        const updated = [...prev, newParticle];
        if (updated.length > count) {
          updated.shift();
        }
        return updated;
      });
    };

    const cleanupParticles = () => {
      const now = Date.now();
      setParticles((prev) => prev.filter((p) => now - p.timestamp < lifetime));
      rafId = requestAnimationFrame(cleanupParticles);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(cleanupParticles);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [count, lifetime, prefersReducedMotion]);

  // No trailing particles for users who prefer reduced motion.
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <Box
      css={{
        position: "fixed",
        top: 0,
        left: 0,
        w: "100%",
        h: "100%",
        pointerEvents: "none",
        zIndex: "mouseEffects",
        ...cssProp,
      }}
    >
      {particles.map((particle) => {
        const age = Date.now() - particle.timestamp;
        const opacity = Math.max(0, 1 - age / lifetime);

        return (
          <Box
            key={particle.id}
            css={{
              position: "absolute",
              color,
              fontSize: size,
              fontWeight: "bold",
              transform: "translate(-50%, -50%)",
              userSelect: "none",
            }}
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              opacity,
            }}
          >
            {character}
          </Box>
        );
      })}
    </Box>
  );
}

MouseTrail.displayName = "MouseTrail";
