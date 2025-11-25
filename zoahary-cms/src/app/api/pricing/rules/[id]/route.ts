import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      name,
      enabled,
      priority,
      geoCities,
      geoRegions,
      startDate,
      endDate,
      products,
    } = body;

    // Supprimer anciennes associations
    await prisma.pricingRuleProduct.deleteMany({
      where: { pricingRuleId: id },
    });

    // Mettre à jour la règle
    const rule = await prisma.pricingRule.update({
      where: { id },
      data: {
        name,
        enabled,
        priority,
        geoCities,
        geoRegions,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        products: {
          create: products.map((p: any) => ({
            productId: p.productId,
            discountType: p.discountType,
            discountValue: p.discountValue,
          })),
        },
      },
      include: {
        products: true,
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Error updating pricing rule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.pricingRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pricing rule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}