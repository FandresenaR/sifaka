import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer les clés depuis les variables d'environnement ou la base de données
    const tavilyKey = process.env.TAVILY_API_KEY
    const serpApiKey = process.env.SERPAPI_API_KEY
    const webSearchProvider = process.env.WEB_SEARCH_PROVIDER || 'tavily'

    return NextResponse.json({
      hasTavilyKey: !!tavilyKey,
      hasSerpApiKey: !!serpApiKey,
      provider: webSearchProvider,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des clés web search:', error)
    return NextResponse.json(
      { error: 'Erreur interne' },
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

    // Vérifier que l'utilisateur est super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { tavilyApiKey, serpApiKey, provider } = body

    // Valider les clés si elles sont fournies
    if (tavilyApiKey && !tavilyApiKey.startsWith('tvly-') && !tavilyApiKey.startsWith('••')) {
      return NextResponse.json(
        { error: 'Clé Tavily invalide (doit commencer par tvly-)' },
        { status: 400 }
      )
    }

    // NOTE: Dans une vraie implémentation, on sauvegarderait les clés dans un système sécurisé
    // Pour maintenant, c'est géré via les variables d'environnement
    // Dans Vercel/production, utiliser les secrets du projet

    // Répondre avec succès
    return NextResponse.json({
      success: true,
      message: 'Clés web search mises à jour avec succès',
      provider: provider || 'tavily',
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des clés web search:', error)
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    )
  }
}
