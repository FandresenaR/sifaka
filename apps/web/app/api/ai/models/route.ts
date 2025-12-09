import { NextRequest, NextResponse } from 'next/server'

// Modèles gratuits connus de OpenRouter
const DEFAULT_FREE_MODELS = [
  {
    id: 'google/gemini-2b-flash-exp',
    name: '⭐ Gemini 2.0 Flash Lite (Recommandé)',
    description: 'Modèle rapide et gratuit de Google',
    pricing: { prompt: '0', completion: '0' },
    contextLength: 1000000,
    isNew: true,
  },
  {
    id: 'mistralai/mistral-7b-instruct',
    name: 'Mistral 7B',
    description: 'Modèle open-source rapide',
    pricing: { prompt: '0', completion: '0' },
    contextLength: 8192,
    isNew: false,
  },
  {
    id: 'meta-llama/llama-2-70b-chat',
    name: 'Llama 2 70B',
    description: 'Modèle puissant de Meta',
    pricing: { prompt: '0', completion: '0' },
    contextLength: 4096,
    isNew: false,
  },
  {
    id: 'google/gemini-pro',
    name: 'Gemini Pro',
    description: 'Modèle standard de Google',
    pricing: { prompt: '0', completion: '0' },
    contextLength: 32768,
    isNew: false,
  },
  {
    id: 'jondurbin/airoboros-l2-70b',
    name: 'Airoboros 70B',
    description: 'Modèle fine-tuné gratuit',
    pricing: { prompt: '0', completion: '0' },
    contextLength: 4096,
    isNew: false,
  },
]

export async function GET(request: NextRequest) {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

    if (!OPENROUTER_API_KEY) {
      console.warn('⚠️ OPENROUTER_API_KEY non configurée - Utilisation des modèles par défaut')
      return NextResponse.json({
        success: true,
        models: DEFAULT_FREE_MODELS,
        stats: {
          totalModels: DEFAULT_FREE_MODELS.length,
          freeModels: DEFAULT_FREE_MODELS.length,
          newModels: DEFAULT_FREE_MODELS.filter((m) => m.isNew).length,
        },
        lastUpdated: new Date().toISOString(),
        warning: 'API Key non configurée - Modèles par défaut utilisés',
      })
    }

    // Récupérer tous les modèles disponibles
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      signal: AbortSignal.timeout(5000), // Timeout de 5 secondes
    })

    if (!response.ok) {
      console.error(`❌ Erreur OpenRouter API: ${response.status} ${response.statusText}`)
      // Fallback aux modèles par défaut
      return NextResponse.json({
        success: true,
        models: DEFAULT_FREE_MODELS,
        stats: {
          totalModels: DEFAULT_FREE_MODELS.length,
          freeModels: DEFAULT_FREE_MODELS.length,
          newModels: DEFAULT_FREE_MODELS.filter((m) => m.isNew).length,
        },
        lastUpdated: new Date().toISOString(),
        warning: 'Impossible de récupérer les modèles - Modèles par défaut utilisés',
      })
    }

    const data = await response.json()

    // Filtrer les modèles gratuits (prix = 0)
    const freeModels = (data.data || [])
      .filter((model: any) => {
        const promptPrice = parseFloat(model.pricing?.prompt || '0')
        const completionPrice = parseFloat(model.pricing?.completion || '0')
        // Un modèle est gratuit si prompt ET completion sont à 0
        return promptPrice === 0 && completionPrice === 0
      })
      .map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description || '',
        pricing: {
          prompt: model.pricing?.prompt || '0',
          completion: model.pricing?.completion || '0',
        },
        contextLength: model.context_length || 0,
        isNew: model.created_at && new Date(model.created_at) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Moins de 2 mois
      }))
      .sort((a: any, b: any) => {
        // Trier: modèles nouveaux d'abord, puis par nom
        if (a.isNew && !b.isNew) return -1
        if (!a.isNew && b.isNew) return 1
        return a.name.localeCompare(b.name)
      })

    // Calculer les statistiques
    const stats = {
      totalModels: data.data?.length || 0,
      freeModels: freeModels.length,
      newModels: freeModels.filter((m: any) => m.isNew).length,
    }

    console.log(`✅ ${freeModels.length} modèles gratuits récupérés de OpenRouter`)

    return NextResponse.json({
      success: true,
      models: freeModels,
      stats,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des modèles OpenRouter:', error)
    // Fallback aux modèles par défaut en cas d'erreur
    return NextResponse.json({
      success: true,
      models: DEFAULT_FREE_MODELS,
      stats: {
        totalModels: DEFAULT_FREE_MODELS.length,
        freeModels: DEFAULT_FREE_MODELS.length,
        newModels: DEFAULT_FREE_MODELS.filter((m) => m.isNew).length,
      },
      lastUpdated: new Date().toISOString(),
      warning: 'Erreur API - Modèles par défaut utilisés',
    })
  }
}
