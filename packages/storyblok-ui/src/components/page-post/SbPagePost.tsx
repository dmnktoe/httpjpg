import { type SbPostData, storyblokEditHref } from "@httpjpg/storyblok-utils";
import { Container, PageActions, Section } from "@httpjpg/ui";
import { memo } from "react";

import { SbPost } from "../post/SbPost";
import { PostBackLink } from "./post-back-link";

export interface SbPagePostProps {
  blok: SbPostData;
}

export const SbPagePost = memo(function SbPagePost({ blok }: SbPagePostProps) {
  return (
    <Section pt={{ base: "8", md: "16" }} pb={{ base: "16", md: "24" }}>
      <Container size="sm">
        <PostBackLink />
        <SbPost blok={blok} sizes="(min-width: 640px) 640px, 100vw" />
      </Container>
      <PageActions editHref={storyblokEditHref(blok._editable)} />
    </Section>
  );
});

SbPagePost.displayName = "SbPagePost";
