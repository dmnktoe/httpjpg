export interface ContainerStoryblok {
  children?: (ContainerStoryblok | PageStoryblok | SlideshowStoryblok)[];
  as: 'div' | 'section' | 'article' | 'main';
  bgColor?: 'transparent' | 'white' | 'black';
  width?: 'full' | 'container';
  _uid: string;
  component: 'container';
  [k: string]: never;
}

export interface PageStoryblok {
  body?: (ContainerStoryblok | PageStoryblok | SlideshowStoryblok)[];
  _uid: string;
  component: 'page';
  uuid?: string;
  [k: string]: never;
}

export type MultiassetStoryblok = {
  alt?: string;
  copyright?: string;
  id: number;
  filename: string;
  name: string;
  title?: string;
  [k: string]: never;
}[];

export interface SlideshowStoryblok {
  images: MultiassetStoryblok;
  _uid: string;
  component: 'slideshow';
  [k: string]: never;
}
