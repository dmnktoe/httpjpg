import { config } from "@httpjpg/config";
import "@httpjpg/tokens/dist/tokens.css";
import "@httpjpg/ui/styles.css";
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

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
