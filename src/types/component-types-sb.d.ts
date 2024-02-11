export interface FeatureStoryblok {
  name?: string;
  _uid: string;
  component: 'feature';
  [k: string]: never;
}

export interface GridStoryblok {
  columns?: FeatureStoryblok[];
  _uid: string;
  component: 'grid';
  [k: string]: never;
}

export interface PageStoryblok {
  body?: (GridStoryblok | PageStoryblok)[];
  _uid: string;
  component: 'page';
  uuid?: string;
  [k: string]: never;
}

export interface TeaserStoryblok {
  headline?: string;
  _uid: string;
  component: 'teaser';
  [k: string]: never;
}
