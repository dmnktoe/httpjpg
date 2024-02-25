export interface ContainerStoryblok {
  children?: (ContainerStoryblok | PageStoryblok | SlideshowStoryblok)[];
  as: 'div' | 'section' | 'article' | 'main';
  bgColor?: 'transparent' | 'white' | 'black';
  width?: 'full' | 'container';
  _uid: string;
  component: 'container';
  [k: string]: unknown;
}

export interface PageStoryblok {
  body?: (ContainerStoryblok | PageStoryblok | SlideshowStoryblok)[];
  seoTitle?: string;
  title?: string;
  seoDescription?: string;
  seo?: unknown;
  _uid: string;
  component: 'page';
  uuid?: string;
  [k: string]: unknown;
}

export type MultiassetStoryblok = {
  alt?: string;
  copyright?: string;
  id: number;
  filename: string;
  name: string;
  title?: string;
  [k: string]: unknown;
}[];

export interface SlideshowStoryblok {
  images: MultiassetStoryblok;
  _uid: string;
  component: 'slideshow';
  [k: string]: unknown;
}
