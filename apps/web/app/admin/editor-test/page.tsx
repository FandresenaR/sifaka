"use client"

import { useState } from "react"
import { Edit, Bold, Italic, Underline, List, ListOrdered, Image, Link, Code, Quote, Heading1, Heading2, Heading3 } from "lucide-react"

export default function EditorTestPage() {
  const [content, setContent] = useState("")
  const [preview, setPreview] = useState(false)

  const toolbarButtons = [
    { icon: Bold, action: "bold", title: "Gras" },
    { icon: Italic, action: "italic", title: "Italique" },
    { icon: Underline, action: "underline", title: "Souligné" },
    { icon: Heading1, action: "h1", title: "Titre 1" },
    { icon: Heading2, action: "h2", title: "Titre 2" },
    { icon: Heading3, action: "h3", title: "Titre 3" },
    { icon: List, action: "ul", title: "Liste à puces" },
    { icon: ListOrdered, action: "ol", title: "Liste numérotée" },
    { icon: Quote, action: "quote", title: "Citation" },
    { icon: Code, action: "code", title: "Code" },
    { icon: Link, action: "link", title: "Lien" },
    { icon: Image, action: "image", title: "Image" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Edit className="w-7 h-7 text-indigo-500" />
          Éditeur de Texte WYSIWYG
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Test de l'éditeur de contenu enrichi
        </p>
      </div>

      {/* Editor Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-wrap">
          {toolbarButtons.map((button) => (
            <button
              key={button.action}
              title={button.title}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              <button.icon className="w-4 h-4" />
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-600 pl-2">
            <button
              onClick={() => setPreview(false)}
              className={`px-3 py-1 rounded text-sm ${!preview ? "bg-indigo-600 text-white" : "text-gray-600 dark:text-gray-400"}`}
            >
              Éditer
            </button>
            <button
              onClick={() => setPreview(true)}
              className={`px-3 py-1 rounded text-sm ${preview ? "bg-indigo-600 text-white" : "text-gray-600 dark:text-gray-400"}`}
            >
              Prévisualiser
            </button>
          </div>
        </div>

        {/* Editor/Preview */}
        {preview ? (
          <div 
            className="p-6 min-h-[400px] prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content || "<p class='text-gray-400'>Aucun contenu à prévisualiser</p>" }}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Commencez à écrire votre contenu ici...

Vous pouvez utiliser du Markdown:
# Titre
## Sous-titre
**gras**, *italique*
- Liste à puces
1. Liste numérotée
> Citation
`code`"
            className="w-full min-h-[400px] p-6 resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          />
        )}
      </div>

      {/* Info */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
        <p className="text-indigo-800 dark:text-indigo-300 text-sm">
          💡 <strong>Note:</strong> Ceci est une version de test de l'éditeur. 
          Un éditeur WYSIWYG complet (TipTap, Slate, etc.) sera intégré dans une version future.
        </p>
      </div>
    </div>
  )
}
