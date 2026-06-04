"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { Footer, type FooterProps } from "../footer/footer";
import { Header, type HeaderProps } from "../header/header";

export interface PageProps {
  header?: HeaderProps;
  footer?: FooterProps;
  children: ReactNode;
  css?: SystemStyleObject;
}

const FOOTER_HEIGHT = 100;

export const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ header, footer, children, css: cssProp, ...props }, ref) => (
    <Box
      ref={ref}
      css={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "pageBg",
        ...cssProp,
      }}
      {...props}
    >
      {header && <Header {...header} />}
      <Box
        as="main"
        css={{ flex: 1, width: "100%", paddingBottom: footer ? `${FOOTER_HEIGHT}px` : "0" }}
      >
        {children}
      </Box>
      {footer && <Footer {...footer} />}
    </Box>
  ),
);

Page.displayName = "Page";
