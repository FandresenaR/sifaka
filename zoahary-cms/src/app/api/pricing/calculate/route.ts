import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API pour calculer les prix avec réductions géolocalisées
 * 
 * POST /api/pricing/calculate
 * Body: {
 *   city: string,
 *   productIds: string[]
 * }
 * 
 * Retourne: {
 *   products: Array<{
 *     id: string,
 *     basePrice: number,
 *     discountedPrice: number,
 *     discount: number,
 *     discountReason: string
 *   }>
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { city, productIds } = await req.json();

    if (!city || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: "Paramètres manquants : city et productIds requis" },
        { status: 400 }
      );
    }

    // Récupérer les produits
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        titleFr: true,
        price: true,
      },
    });

    // Récupérer les règles de pricing applicables
    // On récupère toutes les règles actives et on filtre en JS pour gérer la casse
    const activeRules = await prisma.pricingRule.findMany({
      where: {
        enabled: true,
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } },
            ],
          },
        ],
      },
      include: {
        products: true,
      },
      orderBy: {
        priority: 'desc',
      },
    });

    // Filtrer pour la ville demandée (insensible à la casse)
    const pricingRules = activeRules.filter(rule =>
      rule.geoCities.some(c => c.toLowerCase() === city.toLowerCase())
    );

    // Calculer les prix pour chaque produit
    const result = products.map((product) => {
      const basePrice = product.price;
      let discountedPrice = basePrice;
      let discount = 0;
      let discountReason = null;

      // Appliquer la première règle applicable (priorité la plus élevée)
      for (const rule of pricingRules) {
        const productRule = rule.products.find(
          (pr) => pr.productId === product.id
        );

        if (productRule) {
          if (productRule.discountType === "FIXED") {
            discountedPrice = productRule.discountValue;
            discount = basePrice - discountedPrice;
          } else if (productRule.discountType === "PERCENT") {
            discount = Math.round(basePrice * (productRule.discountValue / 100));
            discountedPrice = basePrice - discount;
          }

          discountReason = rule.name;
          break;
        }
      }

      return {
        id: product.id,
        title: product.titleFr,
        basePrice,
        discountedPrice,
        discount,
        discountReason,
        hasDiscount: discount > 0,
      };
    });

    return NextResponse.json({ products: result });
  } catch (error) {
    console.error("Error calculating pricing:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul des prix" },
      { status: 500 }
    );
  }
}

export const revalidate = 60;
