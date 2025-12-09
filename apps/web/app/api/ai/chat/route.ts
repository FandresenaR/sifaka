import { NextRequest, NextResponse } from 'next/server'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: Message[]
  model: string
  temperature?: number
  maxTokens?: number
}

export async function POST(request: NextRequest) {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Clé API OpenRouter non configurée. Veuillez la configurer dans les paramètres (Admin > Sécurité & Configuration IA).',
          content: '',
        },
        { status: 401 }
      )
    }

    const body: ChatRequest = await request.json()

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages requis' },
        { status: 400 }
      )
    }

    if (!body.model) {
      return NextResponse.json(
        { error: 'Modèle requis' },
        { status: 400 }
      )
    }

    const messages = body.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Appeler OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': `${request.headers.get('origin') || 'http://localhost:3000'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: body.model,
        messages,
        temperature: body.temperature || 0.7,
        max_tokens: body.maxTokens || 1024,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenRouter API error:', errorData)

      // Gestion des erreurs spécifiques
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' },
          { status: 429 }
        )
      }

      if (response.status === 503) {
        return NextResponse.json(
          { error: 'Le modèle est temporairement indisponible. Veuillez essayer un autre modèle.' },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: errorData.error?.message || `Erreur API: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: 'Réponse invalide de l\'API' },
        { status: 500 }
      )
    }

    const content = data.choices[0].message.content

    return NextResponse.json({
      success: true,
      content,
      model: body.model,
      usage: data.usage || {},
    })
  } catch (error) {
    console.error('Erreur lors de l\'appel à OpenRouter:', error)

    // Si c'est une erreur de modèle indisponible, essayer avec un modèle par défaut
    if (error instanceof Error && error.message.includes('503')) {
      return NextResponse.json(
        { error: 'Le modèle est temporairement indisponible. Essayez un autre modèle.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        content: '',
      },
      { status: 500 }
    )
  }
}
