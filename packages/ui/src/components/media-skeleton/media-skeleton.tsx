import { css } from "styled-system/css";

/**
 * `{colors.*}`, not `var(--jpg-colors-*)`: production hashes the vars.
 * `backgroundImage`, not `background`: the shorthand resets the 200% size.
 */
const skeletonClass = css({
  position: "absolute",
  inset: 0,
  zIndex: 1,
  w: "100%",
  h: "100%",
  backgroundImage:
    "linear-gradient(90deg, {colors.neutral.200} 0%, {colors.neutral.300} 50%, {colors.neutral.200} 100%)",
  backgroundSize: "200% 100%",
  transition: "opacity 0.4s ease-in-out",
  animation: "shimmer 1.5s ease-in-out infinite",
  pointerEvents: "none",
  _pageDark: {
    backgroundImage:
      "linear-gradient(90deg, {colors.neutral.800} 0%, {colors.neutral.700} 50%, {colors.neutral.800} 100%)",
  },
  _motionReduce: {
    animation: "none",
  },
});

export interface MediaSkeletonProps {
  visible: boolean;
}

export function MediaSkeleton({ visible }: MediaSkeletonProps) {
  return <div aria-hidden="true" className={skeletonClass} style={{ opacity: visible ? 1 : 0 }} />;
}
