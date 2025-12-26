import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

interface ActivityRequest {
  latitude: number
  longitude: number
  maxDistance: number
  activityTypes: string[]
  aiModel: string
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
  openingHours?: string
}

async function searchActivitiesWithAI(params: ActivityRequest): Promise<Activity[]> {
  const { latitude, longitude, maxDistance, activityTypes, aiModel } = params

  const prompt = `You are a travel expert. Given a user's location and preferences, suggest interesting activities and places to visit.

User Location: ${latitude}, ${longitude}
Search Radius: ${maxDistance}km
Activity Types: ${activityTypes.join(', ')}

Please suggest 5-8 random activities/places of interest within this radius. For each activity, provide:
1. Name
2. Type (one of: ${activityTypes.join(', ')})
3. Approximate latitude/longitude (realistic for the area)
4. Distance in km from user location
5. Brief description (1-2 sentences)
6. Rating out of 5 (if applicable)
7. Opening hours if relevant

Format your response as a JSON array with this structure:
[
  {
    "id": "unique_id",
    "name": "Activity Name",
    "type": "activity_type",
    "latitude": 0.0,
    "longitude": 0.0,
    "distance": 15.5,
    "description": "Brief description",
    "rating": 4.5,
    "openingHours": "9AM-5PM"
  }
]

Ensure the activities are realistic for the given coordinates and distance range. Be creative but practical.`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://sifaka.app',
        'X-Title': 'Shuffle Life - Map Module',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel assistant that generates realistic activity suggestions based on user location.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No response from AI model')
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Could not parse activities from response')
    }

    const activities = JSON.parse(jsonMatch[0]) as Activity[]
    return activities.map((activity, index) => ({
      ...activity,
      id: activity.id || `activity_${Date.now()}_${index}`,
    }))
  } catch (error) {
    console.error('AI search error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    const params: ActivityRequest = await request.json()

    // Validate input
    if (!params.latitude || !params.longitude || !params.maxDistance) {
      return NextResponse.json(
        { error: 'Missing required parameters: latitude, longitude, maxDistance' },
        { status: 400 }
      )
    }

    if (params.maxDistance > 500 || params.maxDistance < 10) {
      return NextResponse.json(
        { error: 'maxDistance must be between 10 and 500 km' },
        { status: 400 }
      )
    }

    const activities = await searchActivitiesWithAI(params)

    return NextResponse.json({
      success: true,
      activities,
      count: activities.length,
      searchParams: {
        latitude: params.latitude,
        longitude: params.longitude,
        maxDistance: params.maxDistance,
      },
    })
  } catch (error) {
    console.error('Map module generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
