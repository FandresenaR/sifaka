import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

interface SearchResult {
  title: string
  url: string
  description: string
  source?: string
}

interface SearchResponse {
  results: SearchResult[]
  provider: string
  query: string
}

async function searchWithTavily(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    throw new Error('Tavily API key not configured')
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 5,
        include_answer: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data = await response.json()

    return data.results.map((result: any) => ({
      title: result.title,
      url: result.url,
      description: result.content,
      source: 'Tavily',
    }))
  } catch (error) {
    console.error('Tavily search error:', error)
    throw error
  }
}

async function searchWithSerpApi(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) {
    throw new Error('SerpAPI key not configured')
  }

  try {
    const params = new URLSearchParams({
      q: query,
      api_key: apiKey,
      num: '5',
    })

    const response = await fetch(`https://serpapi.com/search?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Sifaka CMS)',
      },
    })

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`)
    }

    const data = await response.json()

    return (data.organic_results || []).map((result: any) => ({
      title: result.title,
      url: result.link,
      description: result.snippet,
      source: 'SerpAPI',
    }))
  } catch (error) {
    console.error('SerpAPI search error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { query, provider } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const selectedProvider = provider || process.env.WEB_SEARCH_PROVIDER || 'tavily'
    let results: SearchResult[] = []

    try {
      if (selectedProvider === 'serpapi') {
        results = await searchWithSerpApi(query)
      } else {
        results = await searchWithTavily(query)
      }
    } catch (error) {
      console.error(`${selectedProvider} search failed:`, error)
      // Fallback to empty results instead of error
      results = []
    }

    return NextResponse.json({
      results,
      provider: selectedProvider,
      query,
    } as SearchResponse)
  } catch (error) {
    console.error('Web search error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
