'use client'

import { useEffect, useState } from 'react'
import { MapPin, Loader, AlertCircle, Star, MapPinIcon, Heart, Share2 } from 'lucide-react'
import { useActivityDiscovery, type Activity } from '@/lib/hooks/useActivityDiscovery'

interface ActivityDiscoveryProps {
  projectSlug?: string
  defaultRadius?: number
}

export default function ActivityDiscovery({ projectSlug, defaultRadius = 50 }: ActivityDiscoveryProps) {
  const { activities, loading, error, metadata, userLocation, getLocation, discover, addFavorite } =
    useActivityDiscovery()

  const [radius, setRadius] = useState(defaultRadius)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFavorites, setShowFavorites] = useState(false)

  // Initialize location and discover activities on mount
  useEffect(() => {
    const init = async () => {
      try {
        await getLocation()
      } catch (err) {
        console.error('Failed to get location:', err)
      }
    }
    init()
  }, [getLocation])

  // Discover activities when location or radius changes
  useEffect(() => {
    if (userLocation) {
      discover({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius,
        types: selectedTypes,
      }).catch(console.error)
    }
  }, [userLocation, radius])

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity)
  }

  const handleAddFavorite = async (activity: Activity) => {
    try {
      await addFavorite(activity)
      setFavorites([...favorites, activity.id])
    } catch (err) {
      console.error('Failed to add favorite:', err)
    }
  }

  const isFavorited = (activityId: string) => favorites.includes(activityId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-cyan-400" />
            Shuffle Life - Découverte d'Activités
          </h1>
          <p className="text-gray-400">Trouvez des activités insolites autour de vous</p>
        </div>

        {/* Location Status */}
        {userLocation && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300">
                Localisation activée: {userLocation.latitude.toFixed(3)}°, {userLocation.longitude.toFixed(3)}°
              </span>
            </div>
            {metadata && (
              <span className="text-sm text-cyan-400">
                {metadata.tier === 'FREE' && '📍 Forfait basique (50km max)'}
                {metadata.tier === 'PRO' && '⭐ Pro (200km max)'}
                {metadata.tier === 'PLUS' && '✨ Plus (500km max)'}
              </span>
            )}
          </div>
        )}

        {/* Radius Control */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 mb-6">
          <label className="block text-white font-medium mb-4">
            Rayon de recherche: {radius}km
          </label>
          <input
            type="range"
            min="10"
            max={metadata?.maxRadius || 50}
            step="10"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>10km</span>
            <span>{metadata?.maxRadius || 50}km max</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Erreur</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-cyan-400 animate-spin mr-3" />
            <span className="text-gray-300">Découverte d'activités en cours...</span>
          </div>
        )}

        {/* Activities Grid */}
        {!loading && activities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {activities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => handleActivityClick(activity)}
                className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-cyan-500 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors">
                    {activity.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddFavorite(activity)
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isFavorited(activity.id)
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-600 text-gray-400 hover:bg-red-500/20 hover:text-red-400'
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={isFavorited(activity.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">{activity.type}</span>
                    <span className="text-cyan-400 font-medium">{activity.distance.toFixed(1)}km</span>
                  </div>

                  {activity.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400">{activity.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {activity.address && <p className="text-gray-400">{activity.address}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Activities */}
        {!loading && activities.length === 0 && !error && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucune activité trouvée dans ce rayon</p>
          </div>
        )}

        {/* Selected Activity Details */}
        {selectedActivity && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">{selectedActivity.name}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-gray-400 text-sm">Type</label>
                  <p className="text-white capitalize">{selectedActivity.type}</p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Distance</label>
                  <p className="text-white font-semibold text-cyan-400">{selectedActivity.distance.toFixed(1)}km</p>
                </div>

                {selectedActivity.address && (
                  <div>
                    <label className="text-gray-400 text-sm">Adresse</label>
                    <p className="text-white">{selectedActivity.address}</p>
                  </div>
                )}

                {selectedActivity.rating && (
                  <div>
                    <label className="text-gray-400 text-sm">Note</label>
                    <p className="text-white flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {selectedActivity.rating.toFixed(1)}/5
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-gray-400 text-sm">Coordonnées</label>
                  <p className="text-white text-sm font-mono">
                    {selectedActivity.latitude.toFixed(4)}, {selectedActivity.longitude.toFixed(4)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddFavorite(selectedActivity)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isFavorited(selectedActivity.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-cyan-500 text-white hover:bg-cyan-600'
                  }`}
                >
                  <Heart className="w-4 h-4" fill={isFavorited(selectedActivity.id) ? 'currentColor' : 'none'} />
                  {isFavorited(selectedActivity.id) ? 'En favoris' : 'Ajouter aux favoris'}
                </button>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {metadata && (
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center text-gray-400 text-sm">
            {metadata.count} activité(s) trouvée(s) dans un rayon de {metadata.radius}km
          </div>
        )}
      </div>
    </div>
  )
}
