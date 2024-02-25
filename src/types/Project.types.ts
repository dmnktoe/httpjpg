export interface ProjectTypes {
  id: number;
  name: string;
  description: string;
  images: string[];
  slug: string;
  category: Category;
}

interface Category {
  name: string;
  slug: string;
}
