// Always use relative path for API calls (works in local and production)
const CMS_API_URL = "";

export interface PriceCalculation {
  id: string;
  title: string;
  basePrice: number;
  discountedPrice: number;
  discount: number;
  discountReason: string | null;
  hasDiscount: boolean;
}

export async function calculatePrices(
  productIds: string[],
  city?: string
): Promise<PriceCalculation[]> {
  if (!city || city.trim() === "") {
    // Si pas de ville, retourner les prix standards
    return [];
  }

  const response = await fetch(`/api/pricing/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productIds, city }),
    next: { revalidate: 300 }, // 5 minutes
  });

  if (!response.ok) {
    throw new Error("Erreur lors du calcul des prix");
  }

  const data = await response.json();
  return data.products;
}