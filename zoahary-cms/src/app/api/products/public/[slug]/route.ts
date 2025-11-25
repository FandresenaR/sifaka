import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API publique pour récupérer un produit par slug (sans authentification)
 * Utilisée par le site principal zoahary-baobab.mg
 * 
 * GET /api/products/public/[slug]
 * 
 * Retourne: Product | { error: string }
 * Exemple: /api/products/public/huile-baobab-bio (FR) ou /api/products/public/organic-baobab-oil (EN)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Rechercher par slug FR ou slug EN
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug },
          { slugEn: slug },
        ],
      },
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
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 }
      );
    }

    // Ne retourner que si en stock (ou si comingSoon pour affichage)
    if (!product.inStock && !product.comingSoon) {
      return NextResponse.json(
        { error: "Produit non disponible" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    );
  }
}

// Revalidation ISR - 60 secondes
export const revalidate = 60;
