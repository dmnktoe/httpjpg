export interface ContainerStoryblok {
  children?: (ContainerStoryblok | PageStoryblok | SlideshowStoryblok)[];
  as: 'div' | 'section' | 'article' | 'main';
  bgColor?: 'transparent' | 'white' | 'black';
  width?: 'full' | 'container';
  _uid: string;
  component: 'container';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
}

export interface PageStoryblok {
  body?: (ContainerStoryblok | PageStoryblok | SlideshowStoryblok)[];
  seoTitle?: string;
  title?: string;
  seoDescription?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seo?: any;
  _uid: string;
  component: 'page';
  uuid?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
}

export type MultiassetStoryblok = {
  alt?: string;
  copyright?: string;
  id: number;
  filename: string;
  name: string;
  title?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
}[];

export interface SlideshowStoryblok {
  images: MultiassetStoryblok;
  _uid: string;
  component: 'slideshow';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
}
