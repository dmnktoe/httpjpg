"use client";

import { Box, FloatingWidget, Slideshow } from "@httpjpg/ui";

const NOSTALGIA_ICONS = [
  {
    url: "/images/nostalgia/punkbuster.png",
    alt: "PunkBuster - Anti-Cheat System",
  },
  {
    url: "/images/nostalgia/hamachi.jpg",
    alt: "LogMeIn Hamachi - VPN Gaming",
  },
  {
    url: "/images/nostalgia/m2.jpg",
    alt: "Metin2 - MMORPG Game",
  },
  {
    url: "/images/nostalgia/mobileme.jpg",
    alt: "Apple MobileMe - Cloud Services",
  },
];

const FLOATING_QUERY = "(min-width: 64rem)";

export function NostalgiaSlideshow() {
  return (
    <FloatingWidget
      data-nostalgia=""
      floatingQuery={FLOATING_QUERY}
      css={{
        position: "fixed",
        top: "45vh",
        left: "6",
        zIndex: "widget",
        display: { base: "none", lg: "block" },
        w: "4.375rem",
        h: "auto",
        cursor: "grab",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <Box css={{ transform: "rotate(-4deg)", pointerEvents: "none" }}>
        <Slideshow
          images={NOSTALGIA_ICONS}
          effect="flip"
          aspectRatio="auto"
          autoplayDelay={5000}
          speed={800}
          showNavigation={false}
          disableBlurOnLoad
          css={{
            pointerEvents: "none",
            "& .swiper": {
              borderRadius: "8px",
              overflow: "hidden",
            },
            "& img": {
              width: "100px",
              height: "auto",
              objectFit: "contain",
              imageRendering: "crisp-edges",
            },
          }}
        />
      </Box>
    </FloatingWidget>
  );
}
