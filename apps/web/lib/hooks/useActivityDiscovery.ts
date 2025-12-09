import { useState, useEffect, useCallback } from 'react'

export interface Activity {
  id: string
  name: string
  type: string
  latitude: number
  longitude: number
  distance: number
  rating?: number
  address?: string
  website?: string
  phone?: string
  description?: string
}

export interface DiscoveryState {
  activities: Activity[]
  loading: boolean
  error: string | null
  metadata: {
    count: number
    radius: number
    tier: string
    maxRadius: number
    center: { latitude: number; longitude: number }
  } | null
}

const ACTIVITY_TYPES = [
  'restaurant',
  'park',
  'museum',
  'sports',
  'entertainment',
  'event',
  'hiking',
  'shopping',
  'nightlife',
  'culture',
  'beach',
  'cinema',
  'gallery',
  'cafe',
]

export function useActivityDiscovery() {
  const [state, setState] = useState<DiscoveryState>({
    activities: [],
    loading: false,
    error: null,
    metadata: null,
  })

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  // Get user's current location
  const getLocation = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ latitude, longitude })
          resolve({ latitude, longitude })
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        }
      )
    })
  }, [])

  // Discover nearby activities
  const discover = useCallback(
    async (options: {
      latitude?: number
      longitude?: number
      radius?: number
      types?: string[]
      limit?: number
    }) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        // Use provided location or get current
        let lat = options.latitude
        let lon = options.longitude

        if (!lat || !lon) {
          if (!userLocation) {
            const loc = await getLocation()
            lat = loc.latitude
            lon = loc.longitude
          } else {
            lat = userLocation.latitude
            lon = userLocation.longitude
          }
        }

        const response = await fetch('/api/shuffle-life/activities/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: lat,
            longitude: lon,
            radius: options.radius || 50,
            types: options.types || [],
            limit: options.limit || 20,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Discovery failed')
        }

        const data = await response.json()

        setState({
          activities: data.activities || [],
          loading: false,
          error: null,
          metadata: data.metadata,
        })

        // Cache results
        if (data.activities.length > 0) {
          await cacheActivities(lat, lon, options.radius || 50, data.activities)
        }

        return data
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setState((prev) => ({ ...prev, loading: false, error: message }))
        throw error
      }
    },
    [userLocation, getLocation]
  )

  // Cache activities for 30 minutes
  const cacheActivities = useCallback(
    async (latitude: number, longitude: number, radius: number, activities: Activity[]) => {
      try {
        await fetch('/api/shuffle-life/activities/cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude, radius, activities }),
        })
      } catch (error) {
        console.warn('Cache failed:', error)
      }
    },
    []
  )

  // Get cached activities
  const getFromCache = useCallback(
    async (latitude: number, longitude: number, radius: number) => {
      try {
        const params = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          radius: String(radius),
        })

        const response = await fetch(`/api/shuffle-life/activities/cache?${params}`)
        if (!response.ok) return null

        const data = await response.json()
        return data.activities
      } catch (error) {
        console.warn('Cache retrieval failed:', error)
        return null
      }
    },
    []
  )

  // Add activity to favorites
  const addFavorite = useCallback(async (activity: Activity, notes?: string) => {
    try {
      const response = await fetch('/api/shuffle-life/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: activity.id,
          name: activity.name,
          latitude: activity.latitude,
          longitude: activity.longitude,
          type: activity.type,
          rating: activity.rating,
          address: activity.address,
          notes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add favorite')
      }

      return await response.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(message)
    }
  }, [])

  // Get favorites
  const getFavorites = useCallback(async () => {
    try {
      const response = await fetch('/api/shuffle-life/favorites')
      if (!response.ok) throw new Error('Failed to fetch favorites')
      const data = await response.json()
      return data.favorites || []
    } catch (error) {
      console.error('Error fetching favorites:', error)
      return []
    }
  }, [])

  // Remove from favorites
  const removeFavorite = useCallback(async (placeId: string) => {
    try {
      const response = await fetch(`/api/shuffle-life/favorites?placeId=${placeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove favorite')
      return await response.json()
    } catch (error) {
      console.error('Error removing favorite:', error)
      throw error
    }
  }, [])

  return {
    // State
    ...state,
    userLocation,

    // Methods
    getLocation,
    discover,
    cacheActivities,
    getFromCache,
    addFavorite,
    getFavorites,
    removeFavorite,

    // Constants
    ACTIVITY_TYPES,
  }
}
