import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; moduleId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { slug, moduleId } = await params
    const { enabled } = await request.json()

    // Charger le projet
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    if (project.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Mettre à jour le module
    const updated = await prisma.projectInstalledModule.update({
      where: { id: moduleId },
      data: { enabled },
      include: {
        module: true,
      },
    })

    return NextResponse.json({
      success: true,
      module: updated,
    })
  } catch (error) {
    console.error('Error updating module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; moduleId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { slug, moduleId } = await params

    // Charger le projet
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    if (project.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Supprimer le module
    await prisma.projectInstalledModule.delete({
      where: { id: moduleId },
    })

    return NextResponse.json({
      success: true,
      message: 'Module désinstallé avec succès',
    })
  } catch (error) {
    console.error('Error deleting module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
