import { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'stories',
  description: 'music, photos, bits of life in pieces',
};

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
