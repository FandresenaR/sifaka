import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/rbac"

/**
 * GET /api/users
 * Liste tous les utilisateurs (SUPER_ADMIN uniquement)
 */
export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin()

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            accounts: true,
            sessions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Authentication required") {
        return NextResponse.json(
          { error: "Non authentifié" },
          { status: 401 }
        )
      }
      if (error.message === "Super admin access required") {
        return NextResponse.json(
          { error: "Accès refusé. Seul le super administrateur peut accéder à cette ressource." },
          { status: 403 }
        )
      }
    }

    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    )
  }
}
