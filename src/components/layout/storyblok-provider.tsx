'use client';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';

storyblokInit({
  accessToken: 'PLkrO3gfRkjDlF4jwoQI8wtt',
  use: [apiPlugin],
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default function StoryblokProvider({ children }) {
  return children;
}
