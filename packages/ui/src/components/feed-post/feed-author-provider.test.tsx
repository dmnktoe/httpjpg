import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import { FeedAuthorProvider, useFeedAuthor } from "./feed-author-provider";

describe("useFeedAuthor", () => {
  it("is null outside a provider", () => {
    expect(renderHook(() => useFeedAuthor()).result.current).toBeNull();
  });

  it("hands down the author", () => {
    const author = { name: "httpjpg", avatarSrc: "/me.jpg" };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FeedAuthorProvider author={author}>{children}</FeedAuthorProvider>
    );

    expect(renderHook(() => useFeedAuthor(), { wrapper }).result.current).toBe(author);
  });
});
