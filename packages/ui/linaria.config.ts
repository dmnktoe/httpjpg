/**
 * Linaria configuration for @httpjpg/ui
 *
 * Configuration options for zero-runtime CSS-in-JS extraction.
 * @see https://github.com/callstack/linaria
 */
export default {
  /**
   * Enable evaluation of static expressions at build-time
   * Required for dynamic template literals and calculations
   */
  evaluate: true,

  /**
   * Add readable class names in development for easier debugging
   * In production, uses hashed class names for smaller bundle size
   */
  displayName: process.env.NODE_ENV !== "production",

  /**
   * Custom class name pattern (optional)
   * Format: [filename]__[componentName]--[hash]
   */
  classNameSlug: (hash: string, title: string) => {
    if (process.env.NODE_ENV === "production") {
      return hash;
    }
    return `${title}__${hash}`;
  },
};
