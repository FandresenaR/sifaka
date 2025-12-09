import React from 'react'
import { Copy, Check, MapPin, Star } from 'lucide-react'

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

interface ActivityCardProps {
  activity: Activity
  onCopy: (activity: Activity) => void
  copied: boolean
}

export function ActivityCard({ activity, onCopy, copied }: ActivityCardProps) {
  return (
    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {activity.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {activity.type} • {activity.distance.toFixed(1)} km
          </p>
        </div>
        <button
          onClick={() => onCopy(activity)}
          className="p-2 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-colors ml-2"
          title="Copy activity"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {activity.description && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          {activity.description}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {activity.latitude.toFixed(4)}, {activity.longitude.toFixed(4)}
        </span>
        {activity.rating && (
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            {activity.rating}/5
          </span>
        )}
        {activity.openingHours && (
          <span>{activity.openingHours}</span>
        )}
      </div>
    </div>
  )
}

interface ActivitiesDisplayProps {
  activities: Activity[]
  onCopyActivity: (activity: Activity) => void
  copiedActivityId: string | null
}

export function ActivitiesDisplay({ activities, onCopyActivity, copiedActivityId }: ActivitiesDisplayProps) {
  if (activities.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400">
        <MapPin className="w-4 h-4" />
        Found {activities.length} activities nearby
      </div>
      {activities.map(activity => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onCopy={onCopyActivity}
          copied={copiedActivityId === activity.id}
        />
      ))}
    </div>
  )
}
