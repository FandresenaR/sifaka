import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { moduleId } = params

    // Vérifier que le module appartient à l'utilisateur
    const module = await prisma.projectModuleDefinition.findUnique({
      where: { id: moduleId },
      include: {
        project: true,
      },
    })

    if (!module) {
      return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 })
    }

    if (module.project.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Supprimer le module
    await prisma.projectModuleDefinition.delete({
      where: { id: moduleId },
    })

    return NextResponse.json({
      success: true,
      message: 'Module supprimé avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du module:', error)
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    )
  }
}
