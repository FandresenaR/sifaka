import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface ModuleDefinition {
  moduleName: string
  displayName?: string
  description?: string
  schema: Record<string, any>
  routes?: Record<string, boolean>
  validations?: Record<string, any>
  relationships?: Record<string, any>
  indexes?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId,
      moduleName,
      displayName,
      description,
      schema,
      routes,
      validations,
      relationships,
      indexes,
      aiModel,
      aiPrompt,
    } = body

    // Validation basique
    if (!projectId || !moduleName || !schema) {
      return NextResponse.json(
        { error: 'projectId, moduleName et schema sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le projet appartient à l'utilisateur
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project || project.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Accès refusé au projet' },
        { status: 403 }
      )
    }

    // Créer ou mettre à jour le module
    const module = await prisma.projectModuleDefinition.upsert({
      where: {
        projectId_moduleName: {
          projectId,
          moduleName,
        },
      },
      create: {
        projectId,
        moduleName,
        displayName,
        description,
        schema,
        routes: routes || null,
        validations: validations || null,
        relationships: relationships || null,
        indexes: indexes || [],
        aiModel,
        aiPrompt,
        generatedBy: 'openrouter',
      },
      update: {
        displayName,
        description,
        schema,
        routes: routes || null,
        validations: validations || null,
        relationships: relationships || null,
        indexes: indexes || [],
        aiModel,
        aiPrompt,
      },
    })

    return NextResponse.json({
      success: true,
      module: {
        id: module.id,
        moduleName: module.moduleName,
        displayName: module.displayName,
        description: module.description,
        createdAt: module.createdAt,
      },
      message: `Module "${moduleName}" créé avec succès`,
    })
  } catch (error) {
    console.error('Erreur lors de la création du module:', error)

    // Gestion spécifique des erreurs Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Un module avec ce nom existe déjà dans le projet' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du module' },
      { status: 500 }
    )
  }
}
