import {
  apiPlugin,
  SbButton,
  SbContainer,
  SbGrid,
  SbGridItem,
  SbHeadline,
  SbImage,
  SbMarquee,
  SbMissing,
  SbMusicPlayer,
  SbPage,
  SbPageWork,
  SbParagraph,
  SbRichText,
  SbSection,
  SbSlideshow,
  SbVideo,
  SbWorkCard,
  SbWorkList,
  storyblokInit,
} from "@httpjpg/storyblok-ui";

const components = {
  page: SbPage,
  work: SbPageWork,
  container: SbContainer,
  grid: SbGrid,
  grid_item: SbGridItem,
  section: SbSection,
  button: SbButton,
  headline: SbHeadline,
  image: SbImage,
  marquee: SbMarquee,
  music_player: SbMusicPlayer,
  paragraph: SbParagraph,
  richtext: SbRichText,
  text: SbParagraph,
  slideshow: SbSlideshow,
  video: SbVideo,
  work_card: SbWorkCard,
  work_list: SbWorkList,
};

let initialized = false;

// Imported from both server and client entries so the registry exists on both.
export function initStoryblok() {
  if (initialized) {
    return;
  }
  const registry =
    process.env.NODE_ENV === "development" ? { ...components, _fallback: SbMissing } : components;
  storyblokInit({
    accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
    use: [apiPlugin],
    components: registry,
    apiOptions: { region: "eu" },
    bridge: true,
  });
  initialized = true;
}

initStoryblok();
