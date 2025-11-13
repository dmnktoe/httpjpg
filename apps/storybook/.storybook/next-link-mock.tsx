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
      prefetch,
      replace,
      scroll,
      shallow,
      passHref,
      locale,
      legacyBehavior,
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
