import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { slug } = await params

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

    // Charger les modules du projet
    let modules: any[] = []
    try {
      modules = await prisma.projectInstalledModule.findMany({
        where: { projectId: project.id },
        include: {
          module: true,
        },
        orderBy: { installedAt: 'desc' },
      })
    } catch (dbError: any) {
      // Si la table n'existe pas encore (P2021), retourner un tableau vide avec avertissement
      if (dbError?.code === 'P2021') {
        console.warn('ProjectInstalledModule table does not exist yet. Migration pending.')
        modules = []
      } else {
        throw dbError
      }
    }

    return NextResponse.json({
      success: true,
      modules,
    })
  } catch (error) {
    console.error('Error fetching project modules:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des modules. Veuillez réessayer plus tard.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { slug } = await params
    const { moduleId } = await request.json()

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID required' },
        { status: 400 }
      )
    }

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

    // Vérifier que le module existe
    const module = await prisma.projectModuleDefinition.findUnique({
      where: { id: moduleId },
    })

    if (!module) {
      return NextResponse.json(
        { error: 'Module non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que le module n'est pas déjà installé
    let existing = null
    try {
      existing = await prisma.projectInstalledModule.findUnique({
        where: {
          projectId_moduleId: {
            projectId: project.id,
            moduleId,
          },
        },
      })
    } catch (dbError: any) {
      // Si la table n'existe pas encore, ignorer l'erreur et continuer
      if (dbError?.code !== 'P2021') {
        throw dbError
      }
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Ce module est déjà installé' },
        { status: 400 }
      )
    }

    // Installer le module
    try {
      const installed = await prisma.projectInstalledModule.create({
        data: {
          projectId: project.id,
          moduleId,
          enabled: true,
        },
        include: {
          module: true,
        },
      })

      return NextResponse.json({
        success: true,
        module: installed,
      })
    } catch (dbError: any) {
      // Si la table n'existe pas (P2021)
      if (dbError?.code === 'P2021') {
        return NextResponse.json(
          { error: 'La base de données n\'est pas disponible pour le moment. Migration en cours.' },
          { status: 503 }
        )
      }
      // Si le module est déjà installé (P2002 unique constraint)
      if (dbError?.code === 'P2002') {
        return NextResponse.json(
          { error: 'Ce module est déjà installé dans ce projet' },
          { status: 409 }
        )
      }
      throw dbError
    }
  } catch (error) {
    console.error('Error installing module:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'installation du module. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
