import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireSuperAdmin, getCurrentUser } from "@/lib/rbac"

/**
 * PATCH /api/users/[id]
 * Met à jour le rôle d'un utilisateur (SUPER_ADMIN uniquement)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin()
    const currentUser = await getCurrentUser()
    const { id: userId } = params
    const body = await req.json()
    const { role } = body

    // Validation du rôle
    if (!role || !["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      )
    }

    // Empêcher le super admin de modifier son propre rôle
    if (currentUser?.id === userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier votre propre rôle" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Empêcher de retirer le rôle SUPER_ADMIN du super admin principal
    if (user.email === "fandresenar6@gmail.com" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Impossible de modifier le rôle du super administrateur principal" },
        { status: 403 }
      )
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
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
          { error: "Accès refusé" },
          { status: 403 }
        )
      }
    }

    console.error("Error updating user role:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du rôle" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/[id]
 * Supprime un utilisateur (SUPER_ADMIN uniquement)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin()
    const currentUser = await getCurrentUser()
    const { id: userId } = params

    // Empêcher le super admin de se supprimer lui-même
    if (currentUser?.id === userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Empêcher de supprimer le super admin principal
    if (user.email === "fandresenar6@gmail.com") {
      return NextResponse.json(
        { error: "Impossible de supprimer le super administrateur principal" },
        { status: 403 }
      )
    }

    // Supprimer l'utilisateur (les relations en cascade seront gérées par Prisma)
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: "Utilisateur supprimé avec succès" })
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
          { error: "Accès refusé" },
          { status: 403 }
        )
      }
    }

    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    )
  }
}
