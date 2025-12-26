'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Map from '../../../../../components/map/Map'
import {
  ArrowLeft,
  MapPin,
  Users,
  Heart,
  Map as MapIcon,
  AlertCircle,
  Loader,
  Settings,
  Menu,
  Zap
} from 'lucide-react'

// ... interfaces ...
interface Module {
  id: string
  displayName: string
  moduleName: string
  enabled: boolean
}

interface Project {
  id: string
  name: string
  slug: string
  description?: string
}

interface User {
  id: string
  name?: string
  email: string
  image?: string
  createdAt: string
}

interface Activity {
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

export default function ProjectDashboard() {
  const params = useParams()
  const slug = params.slug as string
  const mapRef = useRef<HTMLDivElement>(null)

  // État
  const [project, setProject] = useState<Project | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [users, setUsers] = useState<User[]>([])
  const [location, setLocation] = useState<Location | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [radius, setRadius] = useState(1000) // Default 1km for OSM
  const [activityTypes, setActivityTypes] = useState<string[]>(['restaurant', 'park', 'cafe'])

  // Charger les données du projet
  useEffect(() => {
    loadProject()
    loadModules()
    loadUsers()
    loadFavorites()
  }, [slug])

  const loadProject = async () => {
    try {
      const res = await fetch(`/api/projects?slug=${slug}`)
      if (res.ok) {
        const data = await res.json()
        const foundProject = data.projects?.find((p: any) => p.slug === slug)
        if (foundProject) {
          setProject(foundProject)
        } else {
          // Fallback si pas trouvé
          setProject({
            id: slug,
            name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
            slug,
            description: 'Projet'
          })
        }
      }
    } catch (err) {
      console.error('Erreur chargement projet:', err)
      // Fallback
      setProject({
        id: slug,
        name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
        slug,
        description: 'Projet'
      })
    }
  }

  const loadModules = async () => {
    try {
      const res = await fetch(`/api/projects/${slug}/modules`)
      if (res.ok) {
        const data = await res.json()
        // Mapper les modules installés pour extraire les données du module
        const installedModules = (data.modules || []).map((pm: any) => ({
          id: pm.id,
          displayName: pm.module.displayName,
          moduleName: pm.module.moduleName,
          enabled: pm.enabled,
        }))
        setModules(installedModules)

        // Définir le premier module actif comme tab par défaut
        const firstEnabled = installedModules.find((m: any) => m.enabled)
        if (firstEnabled) {
          setActiveTab(firstEnabled.moduleName)
        }
      }
    } catch (err) {
      console.error('Erreur chargement modules:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err)
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
      setError(null)
      if (!navigator.geolocation) {
        setError('Géolocalisation non supportée')
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
          setError(`Erreur géolocalisation: ${err.message}`)
        }
      )
    } catch (err) {
      setError('Erreur lors de la géolocalisation')
    }
  }

  const searchActivities = async () => {
    if (!location) {
      setError('Veuillez obtenir votre localisation')
      return
    }

    try {
      setSearching(true)
      setError(null)

      // Use logic similar to useActivities hook, but adjusted for the dashboard structure
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const res = await fetch(`${API_URL}/activities/nearby?lat=${location.latitude}&lon=${location.longitude}&radius=${radius}`)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur recherche')
      }

      const rawActivities = await res.json()

      // Transform backend OSM activities to Dashboard Activity interface
      const mappedActivities: Activity[] = rawActivities.map((act: any) => ({
        placeId: act.id,
        name: act.name,
        address: `${act.category} - ${act.type}`, // Construct a simple address/type string
        latitude: act.location.lat,
        longitude: act.location.lon,
        distance: 0, // Need to calculate or omit
        type: act.type,
        rating: 0
      }));

      setActivities(mappedActivities)

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
        await fetch(`/api/shuffle-life/favorites/${activity.placeId}`, { method: 'DELETE' })
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

  const getModuleIcon = (moduleName: string) => {
    switch (moduleName) {
      case 'UserManagement':
        return <Users className="w-4 h-4" />
      case 'MapDisplay':
      case 'WebActivitySearch':
        return <MapIcon className="w-4 h-4" />
      case 'AIActivityDiscovery':
        return <Heart className="w-4 h-4" />
      case 'IPGeolocation':
        return <MapPin className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  const getModuleLabel = (moduleName: string) => {
    switch (moduleName) {
      case 'UserManagement':
        return 'Utilisateurs'
      case 'MapDisplay':
        return 'Carte'
      case 'AIActivityDiscovery':
        return 'Activités'
      case 'IPGeolocation':
        return 'Géolocalisation'
      case 'WebActivitySearch':
        return 'Recherche Web'
      default:
        return moduleName
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'UserManagement':
        return <UserManagementView users={users} />
      case 'MapDisplay':
      case 'AIActivityDiscovery':
      case 'WebActivitySearch':
      case 'IPGeolocation':
        return (
          <MapActivityView
            location={location}
            activities={activities}
            favorites={favorites}
            loading={loading}
            searching={searching}
            error={error}
            radius={radius}
            activityTypes={activityTypes}
            onGetLocation={getLocation}
            onSearch={searchActivities}
            onSetRadius={setRadius}
            onSetActivityTypes={setActivityTypes}
            onToggleFavorite={toggleFavorite}
            mapRef={mapRef}
          />
        )
      default:
        return <OverviewView project={project} modules={modules} usersCount={users.length} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/admin/projects`}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>

            <div className="flex-1 text-center mx-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
                <div className="text-left">
                  <h1 className="text-xl font-bold text-white">
                    {project?.name || slug}
                  </h1>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {modules.filter(m => m.enabled).length} module{modules.filter(m => m.enabled).length > 1 ? 's' : ''} • Projet actif
                  </p>
                </div>
              </div>
            </div>

            <Link
              href={`/admin/projects/${slug}/modules`}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <Settings className="w-4 h-4" />
              Gérer
            </Link>
          </div>

          {/* Tabs - Module Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
              Aperçu
            </button>

            {modules
              .filter(m => m.enabled)
              .map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveTab(module.moduleName)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === module.moduleName
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  {getModuleIcon(module.moduleName)}
                  {getModuleLabel(module.moduleName)}
                </button>
              ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  )
}

// ============================================
// Vue Aperçu
// ============================================
function OverviewView({ project, modules, usersCount }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Modules actifs</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{modules.length}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Utilisateurs inscrits</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{usersCount}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Statut</h3>
        <p className="text-lg font-semibold text-green-600 dark:text-green-400">✓ Actif</p>
      </div>
    </div>
  )
}

// ============================================
// Vue Gestion Utilisateurs
// ============================================
function UserManagementView({ users }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Utilisateurs Inscrits ({users.length})
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Liste de tous les utilisateurs qui se sont inscrits sur l'application
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Date d'inscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user: User) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {user.image && (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.name || 'Non défini'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                    Voir détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucun utilisateur inscrit</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Vue Carte et Activités
// ============================================
function MapActivityView({
  location,
  activities,
  favorites,
  searching,
  error,
  radius,
  activityTypes,
  onGetLocation,
  onSearch,
  onSetRadius,
  onSetActivityTypes,
  onToggleFavorite,
  mapRef,
}: any) {
  // Map internal Activity to component format expected by Map component
  const mappedActivitiesForMap = (activities || []).map((act: any) => ({
    id: act.placeId,
    name: act.name,
    category: act.type || 'unknown',
    type: act.type || 'unknown',
    location: {
      lat: act.latitude,
      lon: act.longitude
    }
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Contrôles */}
      <div className="space-y-6">
        {/* Localisation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            Localisation
          </h3>

          {location ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">✓ Localisation obtenue</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Lat: {location.latitude.toFixed(4)}° • Lng: {location.longitude.toFixed(4)}°
              </p>
              {location.accuracy && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Précision: ±{Math.round(location.accuracy)}m
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={onGetLocation}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Obtenir ma localisation
            </button>
          )}
        </div>

        {/* Paramètres */}
        {location && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paramètres</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Rayon: {radius} m
                </label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={radius}
                  onChange={(e) => onSetRadius(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Types:
                </label>
                <div className="space-y-2">
                  {['restaurant', 'park', 'cafe', 'museum', 'cinema'].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activityTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onSetActivityTypes([...activityTypes, type])
                          } else {
                            onSetActivityTypes(activityTypes.filter((t: string) => t !== type))
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={onSearch}
                disabled={searching}
                className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
              >
                {searching ? 'Recherche...' : 'Découvrir'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Carte */}
        {location && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-96 relative z-0">
            <Map
              center={[location.latitude, location.longitude]}
              zoom={14}
              activities={mappedActivitiesForMap}
            />
          </div>
        )}

        {/* Activités */}
        {activities.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Activités trouvées ({activities.length})
            </h3>

            <div className="space-y-3">
              {activities.slice(0, 10).map((activity: Activity, index: number) => (
                <div
                  key={activity.placeId || `activity-${index}`}
                  className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{activity.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.address}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                      {activity.rating > 0 && <span>⭐ {activity.rating?.toFixed(1)}/5</span>}
                      <span>📍 {activity.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(activity)}
                    className="ml-4 flex-shrink-0"
                  >
                    <Heart
                      className={`w-5 h-5 ${favorites.includes(activity.placeId)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                        }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!location && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Commencez par obtenir votre localisation</p>
          </div>
        )}
      </div>
    </div>
  )
}
