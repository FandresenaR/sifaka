'use client'

import { useState } from 'react'
import { Copy, Check, Download } from 'lucide-react'

interface TableBlockProps {
  headers: string[]
  rows: (string | number)[][]
}

export function TableBlock({ headers, rows }: TableBlockProps) {
  const [copied, setCopied] = useState(false)
  const [format, setFormat] = useState<'markdown' | 'csv'>('markdown')

  const generateMarkdown = () => {
    const headerRow = '| ' + headers.join(' | ') + ' |'
    const separatorRow = '|' + headers.map(() => ' --- ').join('|') + '|'
    const dataRows = rows.map((row) => '| ' + row.join(' | ') + ' |').join('\n')
    return `${headerRow}\n${separatorRow}\n${dataRows}`
  }

  const generateCSV = () => {
    const headerRow = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',')
    const dataRows = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    return `${headerRow}\n${dataRows}`
  }

  const content = format === 'markdown' ? generateMarkdown() : generateCSV()

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const filename = `table-${Date.now()}.${format}`
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="my-3 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">TABLEAU</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'markdown' | 'csv')}
            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
          >
            <option value="markdown">Markdown</option>
            <option value="csv">CSV</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Copier le tableau"
          >
            {copied ? (
              <>
                <Check size={16} />
              </>
            ) : (
              <>
                <Copy size={16} />
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Télécharger le tableau"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
