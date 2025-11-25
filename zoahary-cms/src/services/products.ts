// Always use relative paths for API calls (works in local and production)
const API_BASE_URL = "";

export interface Product {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  featured: boolean;
  comingSoon: boolean;
  isNew: boolean;
}


export async function getAllProducts(): Promise<Product[]> {
  const response = await fetch(`/api/products/public`, {
    next: { revalidate: 300 }, // 5 minutes
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des produits");
  }
  return response.json();
}


export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await fetch(`/api/products/${slug}`, {
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error("Produit non trouvé");
  }
  return response.json();
}