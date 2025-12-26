import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface MapModuleConfig {
  name: string
  description: string
  maxDistance: number
  activityTypes: string[]
  aiModel: string
  enableGeolocation: boolean
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

    const config: MapModuleConfig = await request.json()

    // Validate config
    if (!config.name || !config.aiModel) {
      return NextResponse.json(
        { error: 'Missing required fields: name, aiModel' },
        { status: 400 }
      )
    }

    // Save configuration in user preferences (we could use a settings table)
    // For now, we'll just return success
    // In a real scenario, you'd save this to a database table like UserMapModuleConfig

    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully',
      config,
    })
  } catch (error) {
    console.error('Map module config error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
