"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { FeedPostAuthor } from "../feed-post/feed-post";

export interface FeedAuthorProviderProps {
  author: FeedPostAuthor | null;
  children: ReactNode;
}

const FeedAuthorContext = createContext<FeedPostAuthor | null>(null);

export function FeedAuthorProvider({ author, children }: FeedAuthorProviderProps) {
  return <FeedAuthorContext.Provider value={author}>{children}</FeedAuthorContext.Provider>;
}

export function useFeedAuthor(): FeedPostAuthor | null {
  return useContext(FeedAuthorContext);
}
