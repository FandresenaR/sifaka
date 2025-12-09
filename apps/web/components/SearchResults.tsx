import React from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface SearchResult {
  title: string
  url: string
  description: string
  source?: string
}

interface SearchResultsProps {
  results: SearchResult[]
  isLoading?: boolean
  error?: string | null
}

export function SearchResults({ results, isLoading = false, error = null }: SearchResultsProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="space-y-2 my-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 animate-pulse h-20"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 my-3">
        <p className="text-xs text-red-700 dark:text-red-400">⚠️ {error}</p>
      </div>
    )
  }

  if (!results || results.length === 0) {
    return null
  }

  return (
    <div className="space-y-2 my-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
      <div className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
        🔍 Résultats de recherche
      </div>
      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded p-2 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                  title={result.title}
                >
                  {result.title}
                </a>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                  {result.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                    title={result.url}
                  >
                    {new URL(result.url).hostname}
                  </a>
                  {result.source && (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      {result.source}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleCopyUrl(result.url)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Copier l'URL"
                >
                  {copiedUrl === result.url ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Ouvrir"
                >
                  <ExternalLink className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
