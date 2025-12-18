/**
 * Z-Index Scale
 * Consistent stacking order for all UI elements
 * Uses 20-step increments for clear hierarchy
 *
 * Usage:
 * ```tsx
 * import { zIndex } from '@httpjpg/tokens';
 * <Box css={{ zIndex: "modal" }} />
 * ```
 */

export const zIndex = {
  /**
   * Background layers (-1)
   * For decorative elements that should appear behind content
   */
  hide: -1,

  /**
   * Base level (0)
   * Default stacking context
   */
  base: 0,

  /**
   * Docked content (20)
   * Video overlays, work cards, copyright labels, grid overlays
   */
  docked: 20,

  /**
   * Slideshow controls (40)
   * Navigation arrows, indicators
   */
  slideshow: 40,

  /**
   * Widget cards (60)
   * PSN card and similar widgets
   */
  widget: 60,

  /**
   * Header / sticky navigation (80)
   * Site header, navigation bars
   */
  header: 80,

  /**
   * Floating widgets (10)
   * Now Playing widget, persistent UI elements - kept low to stay under overlays
   */
  floating: 10,

  /**
   * Dropdown menus (100)
   * Context menus, select dropdowns
   */
  dropdown: 100,

  /**
   * Sticky positioned elements (120)
   * Elements that stick during scroll
   */
  sticky: 120,

  /**
   * Mobile menu overlay (300)
   * Full-screen mobile navigation - MUST be above floating widgets
   */
  mobileMenu: 300,

  /**
   * Mobile menu button (320)
   * Toggle button for mobile menu (must be above menu)
   */
  mobileMenuButton: 320,

  /**
   * Banner notifications (240)
   * Cookie banner, important announcements
   */
  banner: 240,

  /**
   * Overlay backgrounds (220)
   * Modal backdrops, drawer backgrounds
   */
  overlay: 220,

  /**
   * Modal dialogs (240)
   * Dialog boxes, lightboxes
   */
  modal: 240,

  /**
   * Popovers (260)
   * Contextual popups, tooltips with interactions
   */
  popover: 260,

  /**
   * Toast notifications (280)
   * Temporary notification messages
   */
  toast: 280,

  /**
   * Tooltips (300)
   * Hover tooltips, simple info popups
   */
  tooltip: 300,

  /**
   * Mouse effects (320)
   * Mouse trail, cursor followers (below cursor itself)
   */
  mouseEffects: 320,

  /**
   * Image preview overlay (340)
   * Full-screen image previews, preview notifications
   */
  preview: 340,

  /**
   * Cookie consent banner (360)
   * Legal requirement - must be above everything except cursor
   */
  cookieBanner: 360,

  /**
   * Custom cursor (380)
   * Always on top - custom mouse cursor
   */
  cursor: 380,
} as const;

export type ZIndexKey = keyof typeof zIndex;
export type ZIndexValue = (typeof zIndex)[ZIndexKey];
