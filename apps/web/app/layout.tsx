import { config } from "@httpjpg/config";
import "@httpjpg/tokens/dist/tokens.css";
import "@httpjpg/ui/styles.css";
import { Header } from "@httpjpg/ui";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    absolute: config.appName,
    default: config.appName,
    template: `%s | ${config.appName}`,
  },
  description:
    "Personal portfolio showcasing my skills and projects with Panda CSS",
};

// Navigation data
const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Work", href: "/work" },
  { name: "Contact", href: "/contact" },
];

const personalWork = [
  { id: "1", slug: "brutalist-portfolio", title: "Brutalist Portfolio 2024" },
  { id: "2", slug: "design-system", title: "httpjpg Design System" },
  { id: "3", slug: "experimental-ui", title: "Experimental UI Kit" },
];

const clientWork = [
  { id: "1", slug: "client-project-1", title: "Client Alpha - Branding" },
  { id: "2", slug: "client-project-2", title: "Client Beta - Web Design" },
];

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <Header
          nav={navItems}
          personalWork={personalWork}
          clientWork={clientWork}
        />
        {children}
      </body>
    </html>
  );
}
