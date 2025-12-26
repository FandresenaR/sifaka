'use client'

import { useState, useEffect } from 'react'
import { Zap, Copy, Check, Trash2, Eye, Code2 } from 'lucide-react'
import Link from 'next/link'

interface Module {
  id: string
  projectId: string
  moduleName: string
  displayName?: string
  description?: string
  schema: any
  routes?: any
  validations?: any
  createdAt: string
  aiModel?: string
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/ai/modules')
      if (!response.ok) throw new Error('Erreur lors du chargement des modules')
      const data = await response.json()
      setModules(data.modules || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = (module: Module) => {
    const schemaJson = JSON.stringify(module.schema, null, 2)
    navigator.clipboard.writeText(schemaJson)
    setCopiedId(module.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module?')) return

    try {
      const response = await fetch(`/api/ai/modules/${moduleId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Erreur lors de la suppression')
      setModules(modules.filter((m) => m.id !== moduleId))
      setSelectedModule(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="w-7 h-7 text-yellow-500" />
          Modules IA Générés
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gérez et visualisez les modules de données créés par l'IA
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-400">⚠️ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              {modules.length} Module{modules.length !== 1 ? 's' : ''}
            </h2>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            ) : modules.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">Aucun module généré</p>
                <p className="text-xs mt-2">
                  Utilisez le chat IA pour générer des modules
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedModule?.id === module.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {module.displayName || module.moduleName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {module.description || 'Sans description'}
                    </p>
                    {module.aiModel && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        🤖 {module.aiModel}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Module Details */}
        <div className="lg:col-span-2">
          {selectedModule ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedModule.displayName || selectedModule.moduleName}
                  </h3>
                  {selectedModule.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedModule.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteModule(selectedModule.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Supprimer le module"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Nom du module
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {selectedModule.moduleName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Modèle IA
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {selectedModule.aiModel || 'Non spécifié'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Créé le
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {new Date(selectedModule.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Schema Viewer */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Code2 size={16} />
                    Schéma
                  </h4>
                  <button
                    onClick={() => handleCopyCode(selectedModule)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    {copiedId === selectedModule.id ? (
                      <>
                        <Check size={16} />
                        <span>Copié!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs max-h-64">
                  {JSON.stringify(selectedModule.schema, null, 2)}
                </pre>
              </div>

              {/* Routes */}
              {selectedModule.routes && Object.keys(selectedModule.routes).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Routes API</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedModule.routes).map(([key, value]: [string, any]) => (
                      <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="font-mono text-sm text-blue-600 dark:text-blue-400">
                          {key}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validations */}
              {selectedModule.validations &&
                Object.keys(selectedModule.validations).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Validations
                    </h4>
                    <pre className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg overflow-x-auto text-xs">
                      {JSON.stringify(selectedModule.validations, null, 2)}
                    </pre>
                  </div>
                )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center h-96 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                <Eye size={32} className="mx-auto mb-2 opacity-50" />
                <p>Sélectionnez un module pour voir ses détails</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
