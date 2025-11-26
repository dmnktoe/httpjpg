"use client";

import { useEffect, useState } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export interface MouseTrailProps {
  /**
   * Trail character
   * @default "✦"
   */
  character?: string;
  /**
   * Number of trail particles
   * @default 20
   */
  count?: number;
  /**
   * Trail lifetime in ms
   * @default 1000
   */
  lifetime?: number;
  /**
   * Character size
   * @default "24px"
   */
  size?: string;
  /**
   * Trail color
   * @default "black"
   */
  color?: string;
  /**
   * Additional styles
   */
  css?: SystemStyleObject;
}

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Mouse Trail - ASCII trails that follow the cursor
 *
 * Creates brutalist ASCII trails that fade out.
 * Perfect for interactive backgrounds.
 *
 * @example
 * ```tsx
 * // Add to layout
 * <MouseTrail />
 *
 * // Custom character
 * <MouseTrail character="◆" count={30} color="purple" />
 * ```
 */
export function MouseTrail({
  character = "✦",
  count = 20,
  lifetime = 1000,
  size = "24px",
  color = "black",
  css: cssProp,
}: MouseTrailProps) {
  const [particles, setParticles] = useState<TrailParticle[]>([]);
  const [particleId, setParticleId] = useState(0);

  useEffect(() => {
    let rafId: number;
    let lastTime = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();

      // Throttle particle creation (every 30ms for smoother trail)
      if (now - lastTime < 30) {
        return;
      }
      lastTime = now;

      setParticles((prev) => {
        const newParticle: TrailParticle = {
          id: particleId,
          x: e.clientX,
          y: e.clientY,
          timestamp: now,
        };

        setParticleId((id) => id + 1);

        // Keep only the latest particles
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
  }, [count, lifetime, particleId]);

  return (
    <Box
      css={{
        position: "fixed",
        top: 0,
        left: 0,
        w: "100%",
        h: "100%",
        pointerEvents: "none",
        zIndex: 9999,
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
              fontSize: size,
              color,
              fontWeight: "bold",
              userSelect: "none",
              transform: "translate(-50%, -50%)",
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
