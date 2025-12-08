import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

// GET /api/projects/[slug] - Récupérer un projet
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { slug } = await params

    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }

    // Vérifier les permissions
    const isSuperAdmin = session.user.role === "SUPER_ADMIN"
    const isOwner = project.ownerId === session.user.id

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    return NextResponse.json({ project }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération du projet:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[slug] - Mettre à jour un projet
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()

    // Valider les données
    const { name, description, type, status } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Le nom du projet est requis" },
        { status: 400 }
      )
    }

    // Vérifier que le projet existe
    const existingProject = await prisma.project.findUnique({
      where: { slug },
    })

    if (!existingProject) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }

    // Vérifier les permissions
    const isSuperAdmin = session.user.role === "SUPER_ADMIN"
    const isOwner = existingProject.ownerId === session.user.id

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Générer le nouveau slug si le nom a changé
    let newSlug = slug
    if (name.trim() !== existingProject.name) {
      newSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

      // Vérifier que le nouveau slug n'existe pas déjà
      const slugExists = await prisma.project.findUnique({
        where: { slug: newSlug },
      })

      if (slugExists && slugExists.id !== existingProject.id) {
        // Ajouter un suffixe numérique
        let counter = 1
        let testSlug = `${newSlug}-${counter}`
        while (
          await prisma.project.findUnique({ where: { slug: testSlug } })
        ) {
          counter++
          testSlug = `${newSlug}-${counter}`
        }
        newSlug = testSlug
      }
    }

    // Mettre à jour le projet
    const updatedProject = await prisma.project.update({
      where: { slug },
      data: {
        name: name.trim(),
        slug: newSlug,
        description: description?.trim() || null,
        type: type || existingProject.type,
        status: status || existingProject.status,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ project: updatedProject }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du projet:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[slug] - Supprimer un projet
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { slug } = await params

    // Vérifier que le projet existe
    const existingProject = await prisma.project.findUnique({
      where: { slug },
    })

    if (!existingProject) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }

    // Vérifier les permissions
    const isSuperAdmin = session.user.role === "SUPER_ADMIN"
    const isOwner = existingProject.ownerId === session.user.id

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Supprimer le projet
    await prisma.project.delete({
      where: { slug },
    })

    return NextResponse.json(
      { message: "Projet supprimé avec succès" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la suppression du projet:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
