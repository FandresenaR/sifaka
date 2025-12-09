'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  MapPin, 
  Zap, 
  AlertCircle, 
  Loader,
  Heart,
  MapPinOff,
  Search,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'

interface Module {
  id: string
  displayName: string
  moduleName: string
  enabled: boolean
}

interface Activity {
  id: string
  placeId: string
  name: string
  address: string
  latitude: number
  longitude: number
  rating?: number
  distance: number
  type?: string
}

interface Location {
  latitude: number
  longitude: number
  accuracy?: number
}

export default function TestModulesPage() {
  const params = useParams()
  const slug = params.slug as string
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  // État
  const [modules, setModules] = useState<Module[]>([])
  const [location, setLocation] = useState<Location | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [radius, setRadius] = useState(50)
  const [activityTypes, setActivityTypes] = useState<string[]>(['restaurant', 'park', 'cafe'])
  const [showMap, setShowMap] = useState(true)

  // Charger les modules
  useEffect(() => {
    loadModules()
    loadFavorites()
  }, [slug])

  const loadModules = async () => {
    try {
      const res = await fetch(`/api/projects/${slug}/modules`)
      if (res.ok) {
        const data = await res.json()
        setModules(data.modules || [])
      }
    } catch (err) {
      console.error('Erreur chargement modules:', err)
    }
  }

  const loadFavorites = async () => {
    try {
      const res = await fetch('/api/shuffle-life/favorites')
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites?.map((f: any) => f.placeId) || [])
      }
    } catch (err) {
      console.error('Erreur chargement favoris:', err)
    }
  }

  const getLocation = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!navigator.geolocation) {
        setError('Géolocalisation non supportée par votre navigateur')
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
          setLocation(loc)
          setError(null)
        },
        (err) => {
          setError(`Erreur de géolocalisation: ${err.message}`)
        }
      )
    } finally {
      setLoading(false)
    }
  }

  const searchActivities = async () => {
    if (!location) {
      setError('Veuillez d\'abord obtenir votre localisation')
      return
    }

    try {
      setSearching(true)
      setError(null)

      const res = await fetch('/api/shuffle-life/activities/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius,
          activityTypes,
          limit: 20,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la recherche')
      }

      const data = await res.json()
      setActivities(data.activities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSearching(false)
    }
  }

  const toggleFavorite = async (activity: Activity) => {
    try {
      const isFavorite = favorites.includes(activity.placeId)

      if (isFavorite) {
        await fetch(`/api/shuffle-life/favorites/${activity.placeId}`, {
          method: 'DELETE',
        })
        setFavorites(favorites.filter(id => id !== activity.placeId))
      } else {
        await fetch('/api/shuffle-life/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placeId: activity.placeId,
            name: activity.name,
            address: activity.address,
            rating: activity.rating,
          }),
        })
        setFavorites([...favorites, activity.placeId])
      }
    } catch (err) {
      console.error('Erreur favori:', err)
    }
  }

  const isAIActivityDiscoveryEnabled = modules.find(m => m.moduleName === 'AIActivityDiscovery')?.enabled

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/projects/${slug}/modules`}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Test des Modules Shuffle Life
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Découvrez et gérez les activités pour le projet {slug}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Modules & Contrôles */}
          <div className="lg:col-span-1 space-y-6">
            {/* Modules Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Modules Actifs
              </h2>

              <div className="space-y-3">
                {modules.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aucun module installé</p>
                ) : (
                  modules.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600"
                    >
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          module.enabled
                            ? 'bg-green-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {module.displayName || module.moduleName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {module.enabled ? '✓ Activé' : '○ Désactivé'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Localisation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Localisation
              </h2>

              {location ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                      ✓ Localisation obtenue
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Lat: {location.latitude.toFixed(4)}°<br />
                      Lng: {location.longitude.toFixed(4)}°
                    </p>
                    {location.accuracy && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Précision: ±{Math.round(location.accuracy)}m
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={getLocation}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      En cours...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      Obtenir ma localisation
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Rayon de recherche */}
            {location && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-500" />
                  Paramètres
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Rayon: {radius} km
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Ajustez le rayon de recherche
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Types d'activités:
                    </label>
                    <div className="space-y-2">
                      {['restaurant', 'park', 'cafe', 'museum', 'cinema'].map((type) => (
                        <label key={type} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={activityTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setActivityTypes([...activityTypes, type])
                              } else {
                                setActivityTypes(activityTypes.filter(t => t !== type))
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={searchActivities}
                    disabled={searching || !isAIActivityDiscoveryEnabled}
                    className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {searching ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Recherche...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Découvrir les activités
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {!isAIActivityDiscoveryEnabled && location && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-700 dark:text-yellow-300">
                  Le module AIActivityDiscovery est désactivé. Activez-le pour découvrir des activités.
                </p>
              </div>
            )}

            {/* Activités trouvées */}
            {activities.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Activités trouvées ({activities.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.placeId}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg dark:hover:shadow-gray-900/30 transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {activity.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {activity.address}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleFavorite(activity)}
                          className="flex-shrink-0"
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              favorites.includes(activity.placeId)
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="space-y-1">
                          {activity.rating && (
                            <p className="text-gray-600 dark:text-gray-400">
                              ⭐ {activity.rating.toFixed(1)}/5
                            </p>
                          )}
                          <p className="text-gray-600 dark:text-gray-400">
                            📍 {activity.distance.toFixed(1)} km
                          </p>
                        </div>
                        {activity.type && (
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                            {activity.type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* État initial */}
            {!location && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <MapPinOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Commencez par obtenir votre localisation pour découvrir des activités
                </p>
              </div>
            )}

            {location && activities.length === 0 && !searching && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Cliquez sur "Découvrir les activités" pour commencer votre recherche
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
