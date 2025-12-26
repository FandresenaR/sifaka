import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const SUPER_ADMIN_EMAIL = 'fandresenar6@gmail.com'

// Stocker les clés API en mémoire (en production, utiliser une base de données)
const apiKeyStore: Map<string, string> = new Map()

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Seul le super admin peut accéder à cette ressource
    if (session.user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const hasKey = apiKeyStore.has('openrouter_api_key')

    return NextResponse.json({
      hasKey,
      message: hasKey ? 'Clé API configurée' : 'Clé API non configurée',
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de la clé API:', error)
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Seul le super admin peut configurer cette ressource
    if (session.user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { apiKey } = body

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'Clé API invalide' },
        { status: 400 }
      )
    }

    // Valider que c'est une clé OpenRouter valide
    if (!apiKey.startsWith('sk-or-v1-')) {
      return NextResponse.json(
        { error: 'Clé API invalide. Elle doit commencer par "sk-or-v1-"' },
        { status: 400 }
      )
    }

    // Stocker la clé API (en production, utiliser une base de données chiffrée)
    apiKeyStore.set('openrouter_api_key', apiKey)

    // Aussi mettre à jour la variable d'environnement pour les nouvelles requêtes
    process.env.OPENROUTER_API_KEY = apiKey

    return NextResponse.json({
      success: true,
      message: 'Clé API OpenRouter sauvegardée avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la clé API:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur interne',
      },
      { status: 500 }
    )
  }
}
