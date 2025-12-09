'use client'

import { useMemo } from 'react'
import { Copy, Check } from 'lucide-react'
import { CodeBlock } from './CodeBlock'
import { TableBlock } from './TableBlock'
import { useState } from 'react'

interface MessageContentProps {
  content: string
}

interface ParsedContent {
  type: 'text' | 'code' | 'table' | 'list'
  value: any
}

function parseMarkdown(content: string): ParsedContent[] {
  const parts: ParsedContent[] = []
  let remaining = content
  let currentPos = 0

  // Regex pour détecter les blocs de code
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  // Regex pour détecter les tableaux markdown
  const tableRegex = /\|(.+)\n\|[-\s|]+\n((?:\|.+\n?)*)/g

  let lastIndex = 0
  let match

  // Traiter les blocs de code
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Ajouter le texte avant le bloc
    if (match.index > lastIndex) {
      const text = content.substring(lastIndex, match.index).trim()
      if (text) {
        parts.push({ type: 'text', value: text })
      }
    }

    // Ajouter le bloc de code
    const language = match[1] || 'plaintext'
    const code = match[2].trim()
    parts.push({ type: 'code', value: { code, language } })

    lastIndex = match.index + match[0].length
  }

  // Ajouter le texte restant
  if (lastIndex < content.length) {
    const remaining = content.substring(lastIndex).trim()
    if (remaining) {
      parts.push({ type: 'text', value: remaining })
    }
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: content }]
}

function parseTable(tableMarkdown: string) {
  const lines = tableMarkdown.split('\n').filter((l) => l.trim())
  if (lines.length < 2) return null

  const headers = lines[0]
    .split('|')
    .map((h) => h.trim())
    .filter((h) => h)

  const rows = lines
    .slice(2) // Skip header and separator
    .map((line) =>
      line
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell)
    )
    .filter((row) => row.length === headers.length)

  return { headers, rows }
}

export function MessageContent({ content }: MessageContentProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const parsed = useMemo(() => parseMarkdown(content), [content])

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="space-y-2 text-sm">
      {parsed.map((part, index) => (
        <div key={index}>
          {part.type === 'text' && (
            <div className="relative group">
              <p className="whitespace-pre-wrap break-words">{part.value}</p>
              {part.value.length > 50 && (
                <button
                  onClick={() => handleCopyText(part.value, index)}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-200 rounded"
                  title="Copier le texte"
                >
                  {copiedIndex === index ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              )}
            </div>
          )}

          {part.type === 'code' && (
            <CodeBlock code={part.value.code} language={part.value.language} />
          )}
        </div>
      ))}
    </div>
  )
}
