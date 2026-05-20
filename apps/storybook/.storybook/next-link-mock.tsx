import type { AnchorHTMLAttributes, ReactNode } from "react";
import React from "react";

/**
 * Mock Next.js Link component for Storybook
 * Renders a regular anchor tag without Next.js router dependency
 */
interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  locale?: string | false;
  legacyBehavior?: boolean;
}

const NextLinkMock = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      children,
      // Strip Next-only props so they don't leak onto the underlying <a>.
      prefetch: _prefetch,
      replace: _replace,
      scroll: _scroll,
      shallow: _shallow,
      passHref: _passHref,
      locale: _locale,
      legacyBehavior: _legacyBehavior,
      ...props
    },
    ref,
  ) => {
    return (
      <a ref={ref} href={href} {...props}>
        {children}
      </a>
    );
  },
);

NextLinkMock.displayName = "NextLinkMock";

export default NextLinkMock;
