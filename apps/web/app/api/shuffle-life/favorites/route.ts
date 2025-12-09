import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const favorites = await prisma.favoriteActivity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      favorites,
      count: favorites.length,
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des favoris' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { placeId, name, latitude, longitude, type, rating, address } = body

    if (!placeId || !name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Données manquantes (placeId, name, latitude, longitude requises)' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const existing = await prisma.favoriteActivity.findFirst({
      where: {
        userId: session.user.id,
        placeId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Cette activité est déjà en favoris' },
        { status: 409 }
      )
    }

    const favorite = await prisma.favoriteActivity.create({
      data: {
        userId: session.user.id,
        placeId,
        name,
        latitude,
        longitude,
        type: type || 'place',
        rating: rating || null,
        address: address || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Ajouté aux favoris',
      favorite,
    })
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout aux favoris' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('placeId')

    if (!placeId) {
      return NextResponse.json(
        { error: 'placeId requis' },
        { status: 400 }
      )
    }

    const deleted = await prisma.favoriteActivity.deleteMany({
      where: {
        userId: session.user.id,
        placeId,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Favori non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Supprimé des favoris',
    })
  } catch (error) {
    console.error('Error deleting favorite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du favori' },
      { status: 500 }
    )
  }
}
