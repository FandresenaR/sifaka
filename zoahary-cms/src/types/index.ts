export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  featured: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  tags: string[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  role: "USER" | "ADMIN" | "EDITOR";
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProductInput = Omit<Product, "id" | "authorId" | "createdAt" | "updatedAt">;
export type UpdateProductInput = Partial<CreateProductInput>;

export type CreateBlogPostInput = Omit<BlogPost, "id" | "authorId" | "createdAt" | "updatedAt" | "publishedAt">;
export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;
