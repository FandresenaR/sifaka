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
    const modules = await prisma.projectInstalledModule.findMany({
      where: { projectId: project.id },
      include: {
        module: true,
      },
      orderBy: { installedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      modules,
    })
  } catch (error) {
    console.error('Error fetching project modules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const existing = await prisma.projectInstalledModule.findUnique({
      where: {
        projectId_moduleId: {
          projectId: project.id,
          moduleId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ce module est déjà installé' },
        { status: 400 }
      )
    }

    // Installer le module
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
  } catch (error) {
    console.error('Error installing module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
