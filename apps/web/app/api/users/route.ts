import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/users - Liste des utilisateurs (SUPER_ADMIN uniquement)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Seul le SUPER_ADMIN peut lister tous les utilisateurs
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé - Super Admin requis" },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projects: true
          }
        }
      },
      orderBy: [
        { role: "desc" }, // SUPER_ADMIN > ADMIN > USER
        { createdAt: "desc" }
      ]
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// POST /api/users - Créer un utilisateur (invitation)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Seul le SUPER_ADMIN peut créer des utilisateurs
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé - Super Admin requis" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, name, role } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email valide requis" },
        { status: 400 }
      )
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      )
    }

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        role: role || "USER",
        emailVerified: null, // L'utilisateur devra se connecter via OAuth
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
