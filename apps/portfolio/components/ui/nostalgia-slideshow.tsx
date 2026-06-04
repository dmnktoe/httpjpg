"use client";

import { Box, Slideshow } from "@httpjpg/ui";

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

export function NostalgiaSlideshow() {
  return (
    <Box
      css={{
        position: "fixed",
        bottom: "4",
        left: "4",
        zIndex: "widget",
        display: { base: "none", lg: "block" },
        width: "70px",
        height: "auto",
        pointerEvents: "none",
      }}
    >
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
  );
}
