import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: PropsWithChildren) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }
  return children;
}
