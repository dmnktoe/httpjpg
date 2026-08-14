import { IconButton } from "../icon-button/icon-button";
import { HStack } from "../stack/stack";

interface SlideshowNavProps {
  onPrev: () => void;
  onNext: () => void;
}

export function SlideshowNav({ onPrev, onNext }: SlideshowNavProps) {
  return (
    <HStack
      gap="1"
      css={{
        position: "absolute",
        top: "4",
        right: "8",
        zIndex: "docked",
      }}
    >
      <IconButton
        icon="arrow-left"
        variant="default"
        onClick={onPrev}
        aria-label="Previous slide"
        css={NAV_BUTTON_STYLES}
        iconSize="32px"
      />
      <IconButton
        icon="arrow-right"
        variant="default"
        onClick={onNext}
        aria-label="Next slide"
        css={NAV_BUTTON_STYLES}
        iconSize="32px"
      />
    </HStack>
  );
}

const NAV_BUTTON_STYLES = {
  color: "white",
  opacity: 0.35,
  transition: "opacity 0.2s",
  _hover: {
    opacity: 1,
  },
  md: {
    "& svg": {
      width: "48px !important",
      height: "48px !important",
    },
  },
  lg: {
    "& svg": {
      width: "64px !important",
      height: "64px !important",
    },
  },
} as const;
