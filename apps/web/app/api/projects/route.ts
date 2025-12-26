import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/projects - Liste des projets de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const isSuperAdmin = session.user.role === "SUPER_ADMIN"

    // Super admin voit tous les projets, les autres voient seulement les leurs
    const projects = await prisma.project.findMany({
      where: isSuperAdmin ? {} : { ownerId: session.user.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// POST /api/projects - Créer un nouveau projet
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    console.log("DEBUG: POST /api/projects - User ID:", session?.user?.id)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, type, description } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Le nom du projet est requis" },
        { status: 400 }
      )
    }

    // Générer un slug unique
    const baseSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    // Vérifier l'unicité du slug
    let slug = baseSlug
    let counter = 1
    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Mapper le type frontend vers l'enum Prisma
    const typeMapping: Record<string, string> = {
      "ecommerce": "ECOMMERCE",
      "blog": "BLOG",
      "portfolio": "PORTFOLIO",
      "landing": "LANDING",
      "custom": "CUSTOM"
    }

    const projectType = typeMapping[type?.toLowerCase()] || "CUSTOM"

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        slug,
        type: projectType as any,
        description: description?.trim() || null,
        ownerId: session.user.id,
        status: "ACTIVE"
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    )
  }
}
