// @vitest-environment node
import { colors } from "@httpjpg/tokens/colors";
import { renderToStaticMarkup } from "react-dom/server";

import { OgCard, type OgCardProps } from "./og-card";

function render(props: Partial<OgCardProps> = {}): string {
  return renderToStaticMarkup(<OgCard {...BASE} {...props} />).replaceAll("<!-- -->", "");
}

const BASE: OgCardProps = {
  variant: "work",
  slug: ["work", "my-project"],
  title: "MY PROJECT",
  titleSize: 96,
  year: "2024",
  isDark: false,
  imageUrl: "https://a.storyblok.com/f/1/cover.jpg/m/560x300",
  ascii: ":::",
};

describe("OgCard", () => {
  it("prefixes the work slug and overlays the ascii sample", () => {
    const html = render();

    expect(html).toContain(">/WORK/WORK/MY-PROJECT<");
    expect(html).toContain(":::");
    expect(html).toContain("2024");
  });

  it("renders the page layout without ascii and with a root prefix", () => {
    const html = render({ variant: "page", slug: ["cv"] });

    expect(html).toContain(">/CV<");
    expect(html).not.toContain(":::");
  });

  it("falls back to the slug when there is no year", () => {
    const html = render({ year: "", imageUrl: null });

    expect(html).toContain("work / my-project");
    expect(html).not.toContain("<img");
  });

  it("inverts the palette for dark stories", () => {
    const light = render();
    const dark = render({ isDark: true });

    expect(light).toContain(`background:${colors.white}`);
    expect(dark).toContain(`background:${colors.black}`);
  });
});
