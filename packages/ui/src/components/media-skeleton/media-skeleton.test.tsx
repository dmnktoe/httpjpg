import { render } from "@testing-library/react";

import { MediaSkeleton } from "./media-skeleton";

function skeletonOf(container: HTMLElement) {
  const el = container.querySelector("div[aria-hidden='true']");
  if (!el) {
    throw new Error("MediaSkeleton did not render");
  }
  return el as HTMLElement;
}

describe("MediaSkeleton", () => {
  it("is hidden from assistive tech and from hit testing", () => {
    const { container } = render(<MediaSkeleton visible />);

    const skeleton = skeletonOf(container);
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton.className).toContain("pointer-events_none");
  });

  it("fades between visible and resolved instead of unmounting", () => {
    const { container, rerender } = render(<MediaSkeleton visible />);
    expect(skeletonOf(container).style.opacity).toBe("1");

    rerender(<MediaSkeleton visible={false} />);
    expect(skeletonOf(container).style.opacity).toBe("0");
  });

  it("paints above media that is still transparent", () => {
    const { container } = render(<MediaSkeleton visible />);

    expect(skeletonOf(container).className).toContain("z_1");
  });

  it("carries its gradient as a token reference", () => {
    // A hand-written token variable would be hashed away in production and take
    // the whole background declaration with it. `panda-tokens/no-token-var`
    // guards the repo; this pins the skeleton itself.
    const { className } = skeletonOf(render(<MediaSkeleton visible />).container);

    expect(className).toContain("colors.neutral.200");
    expect(className).toContain("colors.neutral.800");
  });
});
