import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Try to find by id first, then by slug
    let product = await prisma.product.findUnique({
      where: { id },
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
      product = await prisma.product.findUnique({
        where: { slug: id },
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
    }

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== "ADMIN" && user?.role !== "EDITOR" && user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await context.params;
    const data = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Seuls les admins peuvent supprimer" }, { status: 403 });
    }

    const { id } = await context.params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produit supprimé" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
