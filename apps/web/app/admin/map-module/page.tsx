'use client'

import { useState, useEffect } from 'react'
import { Map, MapPin, Activity, Zap, Copy, Check, Settings, Plus, Filter } from 'lucide-react'
import Link from 'next/link'

interface Activity {
  id: string
  name: string
  type: string
  latitude: number
  longitude: number
  distance: number
  description?: string
  rating?: number
  openingHours?: string
}

interface MapModuleConfig {
  name: string
  description: string
  maxDistance: number // en km
  activityTypes: string[]
  aiModel: string
  enableGeolocation: boolean
}

export default function MapModulePage() {
  const [config, setConfig] = useState<MapModuleConfig>({
    name: 'Shuffle Life - Map Module',
    description: 'Find random activities within 200km radius',
    maxDistance: 200,
    activityTypes: ['restaurants', 'parks', 'museums', 'sports', 'entertainment', 'events'],
    aiModel: 'openai/gpt-4-turbo',
    enableGeolocation: true,
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedConfig, setSavedConfig] = useState(false)

  // Get user location
  useEffect(() => {
    if (config.enableGeolocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
          setError('Impossible d\'obtenir votre localisation')
        }
      )
    }
  }, [config.enableGeolocation])

  const generateActivities = async () => {
    if (!userLocation) {
      setError('Localisation requise pour générer les activités')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai/map-module/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          maxDistance: config.maxDistance,
          activityTypes: config.activityTypes,
          aiModel: config.aiModel,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la génération')
      }

      const data = await response.json()
      setActivities(data.activities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    try {
      const response = await fetch('/api/ai/map-module/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde')

      setSavedConfig(true)
      setTimeout(() => setSavedConfig(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const toggleActivityType = (type: string) => {
    setConfig(prev => ({
      ...prev,
      activityTypes: prev.activityTypes.includes(type)
        ? prev.activityTypes.filter(t => t !== type)
        : [...prev.activityTypes, type]
    }))
  }

  const copyActivity = (activity: Activity) => {
    const json = JSON.stringify(activity, null, 2)
    navigator.clipboard.writeText(json)
    setCopiedId(activity.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const activityTypeOptions = [
    { id: 'restaurants', label: '🍽️ Restaurants' },
    { id: 'parks', label: '🌳 Parcs' },
    { id: 'museums', label: '🏛️ Musées' },
    { id: 'sports', label: '⚽ Sports' },
    { id: 'entertainment', label: '🎭 Divertissement' },
    { id: 'events', label: '🎪 Événements' },
    { id: 'hiking', label: '🥾 Randonnée' },
    { id: 'shopping', label: '🛍️ Shopping' },
    { id: 'nightlife', label: '🍷 Vie Nocturne' },
    { id: 'culture', label: '🎨 Culture' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Module MAP - Shuffle Life
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Trouve des activités aléatoires dans un rayon de 200km
            </p>
          </div>
        </div>
      </div>

      {/* Location Status */}
      {userLocation ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              Localisation obtenue
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Latitude: {userLocation.lat.toFixed(4)}, Longitude: {userLocation.lng.toFixed(4)}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Accès à la localisation requis pour générer les activités
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </h2>

            {/* Distance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rayon de recherche (km)
              </label>
              <input
                type="number"
                value={config.maxDistance}
                onChange={(e) => setConfig(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                min="10"
                max="500"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Défaut: 200 km pour Shuffle Life
              </p>
            </div>

            {/* AI Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modèle IA
              </label>
              <select
                value={config.aiModel}
                onChange={(e) => setConfig(prev => ({ ...prev, aiModel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
                <option value="google/gemini-2.0-flash-lite">Gemini 2.0 Flash</option>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>

            {/* Save Button */}
            <button
              onClick={saveConfig}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
            >
              {savedConfig ? '✓ Sauvegardé' : 'Sauvegarder Config'}
            </button>
          </div>

          {/* Activity Types Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Types d'activités
            </h2>

            <div className="space-y-2">
              {activityTypeOptions.map(type => (
                <label key={type.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.activityTypes.includes(type.id)}
                    onChange={() => toggleActivityType(type.id)}
                    className="w-4 h-4 rounded border-gray-300 text-cyan-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activités générées ({activities.length})
            </h2>
            <button
              onClick={generateActivities}
              disabled={loading || !userLocation}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Génération...' : 'Générer'}
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Cliquez sur "Générer" pour découvrir les activités à proximité
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {activity.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.type} • {activity.distance.toFixed(1)} km
                      </p>
                    </div>
                    <button
                      onClick={() => copyActivity(activity)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {copiedId === activity.id ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>

                  {activity.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {activity.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{activity.latitude.toFixed(4)}, {activity.longitude.toFixed(4)}</span>
                    {activity.rating && (
                      <>
                        <span>•</span>
                        <span>⭐ {activity.rating}/5</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
        <p className="text-sm text-cyan-700 dark:text-cyan-300">
          💡 Module développé pour <strong>Shuffle Life</strong> - Découvrez des activités aléatoires n'importe où vous allez
        </p>
      </div>
    </div>
  )
}
