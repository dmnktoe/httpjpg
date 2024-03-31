export interface Work {
  id: number;
  title: string;
  description: string;
  images: string[];
  slug: string;
  category: Category;
}

interface Category {
  name: string;
  slug: string;
}
