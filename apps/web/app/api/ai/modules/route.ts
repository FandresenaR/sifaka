import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les modules de l'utilisateur
    const modules = await prisma.projectModuleDefinition.findMany({
      where: {
        project: {
          ownerId: session.user.id,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      modules: modules.map((m) => ({
        id: m.id,
        projectId: m.projectId,
        moduleName: m.moduleName,
        displayName: m.displayName,
        description: m.description,
        schema: m.schema,
        routes: m.routes,
        validations: m.validations,
        createdAt: m.createdAt,
        aiModel: m.aiModel,
      })),
    })
  } catch (error) {
    console.error('Erreur lors du chargement des modules:', error)
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    )
  }
}
