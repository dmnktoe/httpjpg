import { StoryblokComponent, storyblokEditable } from '@storyblok/react/rsc';
import { Container } from 'src/components/layout/Container';

import { ContainerStoryblok } from '@/types/SbComponent.types';

type SbContainerProps = {
  blok: ContainerStoryblok;
};

const SbContainer = ({ blok }: SbContainerProps) => (
  <Container
    as={blok.as}
    width={blok.width}
    bgColor={blok.bgColor}
    py={blok.py}
    pt={blok.pt}
    pb={blok.pb}
    mt={blok.mt}
    mb={blok.mb}
    my={blok.my}
    {...storyblokEditable(blok)}
  >
    {blok.children &&
      blok.children.map((nestedBlok) => (
        <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
  </Container>
);

export default SbContainer;
