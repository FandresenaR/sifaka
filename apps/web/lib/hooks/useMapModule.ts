import { useState } from 'react'

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

export function useMapModule() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
          resolve(location)
        },
        (err) => {
          reject(new Error('Could not get location'))
        }
      )
    })
  }

  const generateActivities = async (
    latitude: number,
    longitude: number,
    maxDistance: number = 200,
    activityTypes: string[] = ['restaurants', 'parks', 'museums', 'sports', 'entertainment', 'events'],
    aiModel: string = 'google/gemini-2.0-flash-lite'
  ): Promise<Activity[]> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai/map-module/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          maxDistance,
          activityTypes,
          aiModel,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error generating activities')
      }

      const data = await response.json()
      return data.activities || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    userLocation,
    getLocation,
    generateActivities,
  }
}
