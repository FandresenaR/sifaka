import { useState, useCallback } from 'react'

interface SearchResult {
  title: string
  url: string
  description: string
  source?: string
}

export function useWebSearch() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)

  const search = useCallback(async (query: string, provider?: string) => {
    setIsSearching(true)
    setSearchError(null)
    setSearchResults([])

    try {
      const response = await fetch('/api/ai/websearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          provider,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche')
      }

      const data = await response.json()
      setSearchResults(data.results || [])
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      setSearchError(message)
      throw error
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setSearchResults([])
    setSearchError(null)
  }, [])

  return {
    search,
    isSearching,
    searchResults,
    searchError,
    clearResults,
  }
}
