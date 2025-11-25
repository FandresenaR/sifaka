import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        role: true,
      },
    });

    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const rules = await prisma.pricingRule.findMany({
      include: {
        products: true,
      },
      orderBy: { priority: "desc" },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching pricing rules:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const rule = await prisma.pricingRule.create({
      data: {
        name,
        enabled: enabled ?? true,
        priority: priority ?? 0,
        geoCities: geoCities || [],
        geoRegions: geoRegions || [],
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
    console.error("Error creating pricing rule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}