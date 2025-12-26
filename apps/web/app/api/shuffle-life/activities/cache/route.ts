import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface CachedActivities {
  userId: string
  latitude: number
  longitude: number
  radius: number
  activities: any[]
  expiresAt: number
}

// Simple in-memory cache (in production, use Redis)
const activityCache = new Map<string, CachedActivities>()

function getCacheKey(userId: string, lat: number, lon: number, radius: number): string {
  // Round to 2 decimals for cache key
  const latRounded = Math.round(lat * 100) / 100
  const lonRounded = Math.round(lon * 100) / 100
  return `${userId}:${latRounded}:${lonRounded}:${radius}`
}

function isCacheValid(cached: CachedActivities): boolean {
  return cached.expiresAt > Date.now()
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const latitude = parseFloat(searchParams.get('latitude') || '')
    const longitude = parseFloat(searchParams.get('longitude') || '')
    const radius = parseFloat(searchParams.get('radius') || '50')

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Paramètres latitude/longitude invalides' },
        { status: 400 }
      )
    }

    const cacheKey = getCacheKey(session.user.id, latitude, longitude, radius)
    const cached = activityCache.get(cacheKey)

    if (cached && isCacheValid(cached)) {
      return NextResponse.json({
        success: true,
        activities: cached.activities,
        source: 'cache',
        metadata: {
          cachedAt: new Date(cached.expiresAt - 30 * 60 * 1000), // 30 min TTL
          expiresAt: new Date(cached.expiresAt),
        },
      })
    }

    return NextResponse.json(
      { error: 'Cache miss ou expiré' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error getting cached activities:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du cache' },
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
    const { latitude, longitude, radius, activities } = body

    if (!latitude || !longitude || !activities) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    const cacheKey = getCacheKey(session.user.id, latitude, longitude, radius || 50)
    const ttl = 30 * 60 * 1000 // 30 minutes

    activityCache.set(cacheKey, {
      userId: session.user.id,
      latitude,
      longitude,
      radius: radius || 50,
      activities,
      expiresAt: Date.now() + ttl,
    })

    // Clean old cache entries
    for (const [key, cached] of activityCache.entries()) {
      if (!isCacheValid(cached)) {
        activityCache.delete(key)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Activités mises en cache',
      ttl: '30 minutes',
    })
  } catch (error) {
    console.error('Error caching activities:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise en cache' },
      { status: 500 }
    )
  }
}
