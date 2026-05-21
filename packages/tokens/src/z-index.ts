/**
 * Z-index scale. Named layers prevent ad-hoc magic numbers leaking into
 * components. Values are spaced in 20-step increments to leave room for
 * future insertions without renumbering the world.
 */
export const zIndex = {
  hide: -1,
  base: 0,
  floating: 10,
  docked: 20,
  slideshow: 40,
  widget: 60,
  header: 80,
  dropdown: 100,
  sticky: 120,
  overlay: 220,
  modal: 240,
  banner: 240,
  popover: 260,
  toast: 280,
  previewBadge: 290,
  mobileMenu: 300,
  tooltip: 300,
  mobileMenuButton: 320,
  previewImage: 340,
  cookieBanner: 360,
  mouseEffects: 380,
  cursor: 400,
} as const;

export type ZIndexKey = keyof typeof zIndex;
export type ZIndexValue = (typeof zIndex)[ZIndexKey];
