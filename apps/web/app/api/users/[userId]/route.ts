import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface RouteParams {
  params: Promise<{
    userId: string
  }>
}

const SUPER_ADMIN_EMAIL = "fandresenar6@gmail.com"

// GET /api/users/[userId] - Récupérer un utilisateur
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const { userId } = await params

    // Un utilisateur peut voir ses propres infos, SUPER_ADMIN peut voir tout le monde
    if (session.user.id !== userId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        projects: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            status: true,
          }
        },
        _count: {
          select: {
            projects: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// PATCH /api/users/[userId] - Mettre à jour un utilisateur
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const { userId } = await params
    const body = await request.json()

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Protection du super admin principal
    if (existingUser.email === SUPER_ADMIN_EMAIL) {
      // Seul le super admin peut se modifier lui-même (et seulement certains champs)
      if (session.user.id !== userId) {
        return NextResponse.json(
          { error: "Le Super Admin principal ne peut pas être modifié" },
          { status: 403 }
        )
      }
      // Le super admin ne peut pas changer son propre rôle
      if (body.role && body.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Le rôle du Super Admin principal ne peut pas être modifié" },
          { status: 403 }
        )
      }
    }

    // Vérification des permissions
    const canModify = 
      session.user.id === userId || // L'utilisateur peut se modifier
      session.user.role === "SUPER_ADMIN" // SUPER_ADMIN peut modifier tout le monde

    if (!canModify) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    // Si l'utilisateur modifie son propre profil, il ne peut pas changer son rôle
    const updateData: any = {}
    
    if (body.name !== undefined) {
      updateData.name = body.name
    }

    // Seul SUPER_ADMIN peut modifier le rôle (sauf pour le super admin principal)
    if (body.role && session.user.role === "SUPER_ADMIN" && existingUser.email !== SUPER_ADMIN_EMAIL) {
      updateData.role = body.role
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[userId] - Supprimer un utilisateur
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Seul SUPER_ADMIN peut supprimer des utilisateurs
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé - Super Admin requis" },
        { status: 403 }
      )
    }

    const { userId } = await params

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Protection du super admin principal
    if (existingUser.email === SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Le Super Admin principal ne peut pas être supprimé" },
        { status: 403 }
      )
    }

    // Empêcher la suppression de soi-même
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 403 }
      )
    }

    // Supprimer l'utilisateur (cascade sur les projets via Prisma)
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json(
      { message: "Utilisateur supprimé avec succès" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
