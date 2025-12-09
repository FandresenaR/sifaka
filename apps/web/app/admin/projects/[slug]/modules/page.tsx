'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Zap, Copy, Check, Trash2, Plus, Eye, Code2, Settings, Download, AlertCircle } from 'lucide-react'
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
  enabled?: boolean
}

interface ProjectModule {
  id: string
  projectId: string
  moduleId: string
  enabled: boolean
  customConfig?: any
  installedAt: string
  module: Module
}

export default function ProjectModulesPage() {
  const params = useParams()
  const slug = params.slug as string
  const [projectModules, setProjectModules] = useState<ProjectModule[]>([])
  const [availableModules, setAvailableModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadModules()
  }, [slug])

  const loadModules = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Charger les modules du projet
      const projectRes = await fetch(`/api/projects/${slug}/modules`)
      if (!projectRes.ok) throw new Error('Erreur lors du chargement des modules du projet')
      const projectData = await projectRes.json()
      setProjectModules(projectData.modules || [])

      // Charger tous les modules disponibles
      const availableRes = await fetch('/api/ai/modules')
      if (!availableRes.ok) throw new Error('Erreur lors du chargement des modules disponibles')
      const availableData = await availableRes.json()
      setAvailableModules(availableData.modules || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInstallModule = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/projects/${slug}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de l\'installation')
      }

      await loadModules()
      setShowInstallModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const handleToggleModule = async (projectModuleId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/projects/${slug}/modules/${projectModuleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      await loadModules()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const handleDeleteModule = async (projectModuleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désinstaller ce module?')) return

    try {
      setDeletingId(projectModuleId)
      const response = await fetch(`/api/projects/${slug}/modules/${projectModuleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      await loadModules()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCopyCode = (module: Module) => {
    const schemaJson = JSON.stringify(module.schema, null, 2)
    navigator.clipboard.writeText(schemaJson)
    setCopiedId(module.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownloadModule = (module: Module) => {
    const content = JSON.stringify(
      {
        name: module.moduleName,
        displayName: module.displayName,
        description: module.description,
        schema: module.schema,
        routes: module.routes,
        validations: module.validations,
      },
      null,
      2
    )
    
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${module.moduleName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getUninstalledModules = () => {
    const installedIds = new Set(projectModules.map(pm => pm.moduleId))
    return availableModules.filter(m => !installedIds.has(m.id))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des modules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Modules du Projet
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez les modules IA installés dans votre projet
            </p>
          </div>
        </div>

        <Link
          href={`/admin/projects/${slug}`}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ← Retour
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 dark:text-red-300 font-medium">Erreur</p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Modules Installed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Modules Installés ({projectModules.length})
            </h2>
            {getUninstalledModules().length > 0 && (
              <button
                onClick={() => setShowInstallModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                Installer un Module
              </button>
            )}
          </div>

          {projectModules.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Aucun module installé pour le moment
              </p>
              {getUninstalledModules().length > 0 && (
                <button
                  onClick={() => setShowInstallModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Installer le premier module
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {projectModules.map(pm => (
                <div
                  key={pm.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {pm.module.displayName || pm.module.moduleName}
                        </h3>
                        <button
                          onClick={() => handleToggleModule(pm.id, pm.enabled)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            pm.enabled
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {pm.enabled ? '✓ Actif' : '○ Inactif'}
                        </button>
                      </div>
                      {pm.module.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {pm.module.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Installé le: {new Date(pm.installedAt).toLocaleDateString('fr-FR')}
                        {pm.module.aiModel && ` • Modèle: ${pm.module.aiModel}`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteModule(pm.id)}
                      disabled={deletingId === pm.id}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedModule(pm.module)
                      }}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </button>
                    <button
                      onClick={() => handleCopyCode(pm.module)}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                    >
                      {copiedId === pm.module.id ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          Copié!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copier Schema
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadModule(pm.module)}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Module Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedModule ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-24 space-y-4">
              <button
                onClick={() => setSelectedModule(null)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Fermer
              </button>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedModule.displayName || selectedModule.moduleName}
                </h3>
                {selectedModule.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedModule.description}
                  </p>
                )}
              </div>

              {selectedModule.schema && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    Schéma
                  </h4>
                  <pre className="bg-gray-900 dark:bg-black text-green-400 p-3 rounded-lg text-xs overflow-auto max-h-48">
                    {JSON.stringify(selectedModule.schema, null, 2)}
                  </pre>
                </div>
              )}

              {selectedModule.routes && Object.keys(selectedModule.routes).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Routes API
                  </h4>
                  <ul className="text-xs space-y-1">
                    {Object.entries(selectedModule.routes).map(([key, route]: any) => (
                      <li key={key} className="text-gray-600 dark:text-gray-400">
                        <span className="font-mono text-blue-600 dark:text-blue-400">{key}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedModule.validations && Object.keys(selectedModule.validations).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Validations
                  </h4>
                  <ul className="text-xs space-y-1">
                    {Object.entries(selectedModule.validations).map(([key]: any) => (
                      <li key={key} className="text-gray-600 dark:text-gray-400">
                        ✓ {key}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 sticky top-24 text-center">
              <Eye className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sélectionnez un module pour voir les détails
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Install Module Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-auto border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Installer un Module
            </h2>

            {getUninstalledModules().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Tous les modules disponibles sont déjà installés
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {getUninstalledModules().map(module => (
                  <div
                    key={module.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {module.displayName || module.moduleName}
                      </h3>
                      {module.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {module.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleInstallModule(module.id)}
                      className="ml-4 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all whitespace-nowrap"
                    >
                      Installer
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowInstallModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
