import { css } from "styled-system/css";

/**
 * Colors go through Panda's `{token.path}` syntax, not a literal
 * `var(--colors-*)`. Production hashes every token variable, so a
 * hand-written name resolves to nothing and the whole `background`
 * declaration is dropped — an invisible skeleton.
 *
 * `backgroundImage` for the same reason `background` would be wrong: the
 * shorthand resets `background-size`, and the shimmer sweep needs the
 * gradient to stay twice as wide as the box.
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
