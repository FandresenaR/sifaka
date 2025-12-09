import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Subscription tiers et leurs limites
const SUBSCRIPTION_LIMITS = {
  FREE: { maxRadius: 50, description: 'Forfait basique' },
  PRO: { maxRadius: 200, description: 'Abonnement Pro' },
  PLUS: { maxRadius: 500, description: 'Abonnement Plus' },
}

interface DiscoveryRequest {
  latitude: number
  longitude: number
  radius?: number
  types?: string[]
  limit?: number
}

interface Activity {
  id: string
  name: string
  type: string
  latitude: number
  longitude: number
  distance: number
  description?: string
  rating?: number
  address?: string
  website?: string
  phone?: string
}

// Types d'activités supportées
const ACTIVITY_TYPES = [
  'restaurant',
  'park',
  'museum',
  'sports',
  'entertainment',
  'event',
  'hiking',
  'shopping',
  'nightlife',
  'culture',
  'beach',
  'cinema',
  'gallery',
  'cafe',
]

async function getUserSubscriptionTier(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        // TODO: add subscription model later
        // subscription: { select: { tier: true } }
      },
    })

    // TODO: check actual subscription tier
    // For now, default to FREE
    return 'FREE' as keyof typeof SUBSCRIPTION_LIMITS
  } catch (error) {
    return 'FREE' as keyof typeof SUBSCRIPTION_LIMITS
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

async function fetchGoogleMapsActivities(
  latitude: number,
  longitude: number,
  radiusKm: number,
  types: string[] = []
): Promise<Activity[]> {
  try {
    const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY
    if (!googleMapsKey) {
      console.warn('GOOGLE_MAPS_API_KEY not configured, using fallback')
      return generateFallbackActivities(latitude, longitude, radiusKm)
    }

    // Call Google Places API
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.searchParams.set('location', `${latitude},${longitude}`)
    url.searchParams.set('radius', String(radiusKm * 1000)) // Convert to meters
    url.searchParams.set('key', googleMapsKey)

    // Add type filter if specified
    if (types.length > 0) {
      url.searchParams.set('type', types[0]) // Google Maps accepts one type at a time
    }

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK') {
      console.warn('Google Maps API error:', data.status)
      return generateFallbackActivities(latitude, longitude, radiusKm)
    }

    return (data.results || []).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      type: place.types?.[0] || 'place',
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      distance: calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng),
      rating: place.rating,
      address: place.vicinity,
      website: place.website,
      phone: place.formatted_phone_number,
    }))
  } catch (error) {
    console.error('Error fetching Google Maps activities:', error)
    return generateFallbackActivities(latitude, longitude, radiusKm)
  }
}

function generateFallbackActivities(latitude: number, longitude: number, radiusKm: number): Activity[] {
  // Fallback: Generate synthetic activities based on location
  const activities: Activity[] = []

  const activityNames = {
    restaurant: ['Pizza Italia', 'Sushi House', 'Burger Fusion', 'Cafe Noir', 'Bistro Rouge'],
    park: ['Central Park', 'Green Valley Park', 'Riverside Park', 'Forest Trail', 'Mountain View'],
    museum: ['Art Museum', 'History Museum', 'Science Center', 'Gallery', 'Heritage Museum'],
    sports: ['Gym & Fitness', 'Tennis Court', 'Swimming Pool', 'Basketball Court', 'Yoga Studio'],
    entertainment: ['Cinema', 'Theater', 'Nightclub', 'Concert Hall', 'Bowling Alley'],
  }

  const types = Object.keys(activityNames)
  
  for (let i = 0; i < 8; i++) {
    const type = types[i % types.length]
    const names = activityNames[type as keyof typeof activityNames]
    const name = names[Math.floor(Math.random() * names.length)]
    
    const distance = Math.random() * radiusKm
    const angle = Math.random() * Math.PI * 2
    const dlat = (distance / 111) * Math.cos(angle)
    const dlon = (distance / (111 * Math.cos((latitude * Math.PI) / 180))) * Math.sin(angle)

    activities.push({
      id: `fallback_${i}`,
      name: `${name} #${i + 1}`,
      type,
      latitude: latitude + dlat,
      longitude: longitude + dlon,
      distance: parseFloat(distance.toFixed(1)),
      rating: 3.5 + Math.random() * 1.5,
      description: `A great place to visit in the area`,
      address: 'View on map for details',
    })
  }

  return activities
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body: DiscoveryRequest = await request.json()

    // Validate input
    if (!body.latitude || !body.longitude) {
      return NextResponse.json(
        { error: 'Latitude et longitude requises' },
        { status: 400 }
      )
    }

    if (body.latitude < -90 || body.latitude > 90 || body.longitude < -180 || body.longitude > 180) {
      return NextResponse.json(
        { error: 'Coordonnées invalides' },
        { status: 400 }
      )
    }

    // Get user subscription tier
    const tier = await getUserSubscriptionTier(session.user.id)
    const limits = SUBSCRIPTION_LIMITS[tier]
    let radius = body.radius || limits.maxRadius

    // Enforce subscription limits
    if (radius > limits.maxRadius) {
      return NextResponse.json(
        {
          error: `Rayon limité à ${limits.maxRadius}km avec votre forfait`,
          maxRadius: limits.maxRadius,
          currentTier: tier,
          suggestion: tier === 'FREE' ? 'Passez à Pro pour 200km' : 'Passez à Plus pour 500km',
        },
        { status: 403 }
      )
    }

    // Validate radius
    if (radius < 1 || radius > limits.maxRadius) {
      return NextResponse.json(
        {
          error: `Rayon doit être entre 1 et ${limits.maxRadius}km`,
          maxRadius: limits.maxRadius,
        },
        { status: 400 }
      )
    }

    // Validate and filter activity types
    const types = body.types
      ?.filter((t) => ACTIVITY_TYPES.includes(t.toLowerCase()))
      .map((t) => t.toLowerCase()) || []

    const limit = Math.min(body.limit || 20, 50) // Max 50 results

    // Fetch activities from Google Maps or fallback
    let activities = await fetchGoogleMapsActivities(body.latitude, body.longitude, radius, types)

    // Filter by types if specified
    if (types.length > 0) {
      activities = activities.filter((a) => types.includes(a.type.toLowerCase()))
    }

    // Filter by distance
    activities = activities.filter((a) => a.distance <= radius)

    // Sort by distance
    activities.sort((a, b) => a.distance - b.distance)

    // Limit results
    activities = activities.slice(0, limit)

    // Save to database for analytics
    try {
      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          type: 'discovery',
          latitude: body.latitude,
          longitude: body.longitude,
          radius,
          resultCount: activities.length,
          metadata: {
            types,
            tier,
          },
        },
      })
    } catch (dbError) {
      console.warn('Error saving activity log:', dbError)
      // Continue anyway, logging is not critical
    }

    return NextResponse.json({
      success: true,
      activities,
      metadata: {
        count: activities.length,
        radius,
        tier,
        maxRadius: limits.maxRadius,
        center: {
          latitude: body.latitude,
          longitude: body.longitude,
        },
      },
    })
  } catch (error) {
    console.error('Error in discovery:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la découverte d\'activités' },
      { status: 500 }
    )
  }
}
