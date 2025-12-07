import { z } from "zod";

export const productSchema = z.object({
    title: z.string().min(1, "Le titre est requis"),
    slug: z.string().min(1, "Le slug est requis"),
    description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
    price: z.number().positive("Le prix doit être positif"),
    images: z.array(z.string().url("URL d'image invalide")),
    category: z.string().min(1, "La catégorie est requise"),
    inStock: z.boolean().default(true),
    featured: z.boolean().default(false),
});

export const blogPostSchema = z.object({
    title: z.string().min(1, "Le titre est requis"),
    slug: z.string().min(1, "Le slug est requis"),
    content: z.string().min(20, "Le contenu doit contenir au moins 20 caractères"),
    excerpt: z.string().optional(),
    coverImage: z.string().url("URL d'image invalide").optional(),
    published: z.boolean().default(false),
    tags: z.array(z.string()),
});

export const userUpdateSchema = z.object({
    name: z.string().optional(),
    role: z.enum(["USER", "ADMIN", "EDITOR"]).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
