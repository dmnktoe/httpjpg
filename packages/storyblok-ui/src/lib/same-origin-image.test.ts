import { sameOriginImageUrl } from "./same-origin-image";

describe("sameOriginImageUrl", () => {
  it("encodes the source and snaps the width up to an optimizer size", () => {
    expect(sameOriginImageUrl("https://a.storyblok.com/f/1/a b.jpg", 1000)).toBe(
      "/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F1%2Fa%20b.jpg&w=1080&q=80",
    );
  });

  it("caps at the largest size and takes a quality", () => {
    expect(sameOriginImageUrl("x", 9000, 60)).toBe("/_next/image?url=x&w=3840&q=60");
    expect(sameOriginImageUrl("x")).toContain("&w=1200&q=80");
  });
});
