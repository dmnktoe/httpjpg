import { env } from "@httpjpg/env";
import {
  apiPlugin,
  SbAccordion,
  SbButton,
  SbCallout,
  SbCodeBlock,
  SbContainer,
  SbDivider,
  SbGrid,
  SbGridItem,
  SbHeadline,
  SbIcon,
  SbImage,
  SbLink,
  SbList,
  SbMarquee,
  SbMissing,
  SbMusicPlayer,
  SbPage,
  SbPageWork,
  SbParagraph,
  SbRichText,
  SbScrollClipImage,
  SbSection,
  SbSlideshow,
  SbStats,
  SbVideo,
  SbWorkCard,
  SbWorkList,
  storyblokInit,
} from "@httpjpg/storyblok-ui";

const components = {
  accordion: SbAccordion,
  button: SbButton,
  callout: SbCallout,
  code_block: SbCodeBlock,
  container: SbContainer,
  divider: SbDivider,
  grid: SbGrid,
  grid_item: SbGridItem,
  headline: SbHeadline,
  icon: SbIcon,
  image: SbImage,
  link: SbLink,
  list: SbList,
  marquee: SbMarquee,
  music_player: SbMusicPlayer,
  page: SbPage,
  paragraph: SbParagraph,
  richtext: SbRichText,
  scroll_clip_image: SbScrollClipImage,
  section: SbSection,
  slideshow: SbSlideshow,
  stats: SbStats,
  // Legacy alias: old stories may still contain "text" bloks; the schema was
  // replaced by "paragraph" and no longer exists in storyblok-sync.
  text: SbParagraph,
  video: SbVideo,
  work: SbPageWork,
  work_card: SbWorkCard,
  work_list: SbWorkList,
};

let initialized = false;

// Imported from both server and client entries so the registry exists on both.
function initStoryblok() {
  if (initialized) {
    return;
  }
  const registry =
    process.env.NODE_ENV === "development" ? { ...components, _fallback: SbMissing } : components;
  storyblokInit({
    accessToken: env.NEXT_PUBLIC_STORYBLOK_TOKEN,
    use: [apiPlugin],
    components: registry,
    apiOptions: { region: "eu" },
    bridge: true,
  });
  initialized = true;
}

initStoryblok();
