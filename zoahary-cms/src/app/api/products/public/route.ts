export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { withCors } from "@/lib/cors";

/**
 * API publique pour récupérer les produits (sans authentification)
 * Utilisée par le site principal zoahary-baobab.mg
 * 
 * GET /api/products/public
 * Query params:
 *   - category: string (optionnel) - Filtrer par catégorie
 *   - featured: string (optionnel) - "true" pour produits vedettes uniquement
 *   - lang: string (optionnel) - "fr" ou "en" pour la langue (défaut: "fr")
 *   - city: string (optionnel) - Ville pour calculer les réductions (ex: "Tuléar")
 * 
 * Retourne: Product[] avec prix calculés selon la géolocalisation
 * Exemple: /api/products/public?lang=fr&city=Tuléar&featured=true
 * 
 * Rate limit: 100 requests per 15 minutes per IP
 * CORS: Enabled for allowed origins
 */
async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const lang = searchParams.get("lang") || "fr";
    const city = searchParams.get("city");

    const where: any = {
      inStock: true,
    };

    if (category) {
      where.category = category;
    }

    if (featured === "true") {
      where.featured = true;
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        titleFr: true,
        titleEn: true,
        descriptionFr: true,
        descriptionEn: true,
        slug: true,
        slugEn: true,
        price: true,
        images: true,
        category: true,
        featured: true,
        inStock: true,
        isNew: true,
        comingSoon: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { featured: 'desc' },
        { isNew: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Traduction des catégories
    const categoryTranslations: Record<string, { fr: string; en: string }> = {
      "Produits de Consommation": { fr: "Produits de Consommation", en: "Consumer Products" },
      "Cosmétiques": { fr: "Cosmétiques", en: "Cosmetics" },
      "Autres": { fr: "Autres", en: "Others" },
    };

    // Récupérer les règles de pricing si une ville est spécifiée
    let pricingRules: any[] = [];
    if (city) {
      // On récupère toutes les règles actives et on filtre en JS pour gérer la casse (Toliara vs toliara)
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
      pricingRules = activeRules.filter(rule =>
        rule.geoCities.some(c => c.toLowerCase() === city.toLowerCase())
      );
    }

    // Formater les produits selon la langue et calculer les prix
    const formattedProducts = products.map((p) => {
      const basePrice = p.price;
      let discountedPrice = basePrice;
      let discount = 0;
      let discountReason = null;

      // Calculer la réduction si applicable
      if (city && pricingRules.length > 0) {
        for (const rule of pricingRules) {
          const productRule = rule.products.find(
            (pr: any) => pr.productId === p.id
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
            break; // Utiliser la première règle (priorité la plus élevée)
          }
        }
      }

      return {
        id: p.id,
        title: lang === "en" ? p.titleEn : p.titleFr,
        titleFr: p.titleFr,
        titleEn: p.titleEn,
        description: lang === "en" ? p.descriptionEn : p.descriptionFr,
        slug: lang === "en" && p.slugEn ? p.slugEn : p.slug,
        price: discountedPrice,
        originalPrice: discount > 0 ? basePrice : undefined,
        discount: discount > 0 ? discount : undefined,
        discountReason: discountReason,
        images: p.images,
        category: p.category,
        categoryTranslated: categoryTranslations[p.category]?.[lang as "fr" | "en"] || p.category,
        featured: p.featured,
        inStock: p.inStock,
        isNew: p.isNew,
        comingSoon: p.comingSoon,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching public products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}

// Apply rate limiting and CORS
export const GET = withCors(withRateLimit(handler, RATE_LIMITS.PUBLIC));

// Revalidation ISR - 60 secondes
export const revalidate = 60;
