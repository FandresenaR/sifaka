'use client';

import { useState } from 'react';
import Map from '../../components/map/Map';
import { useActivities } from '../../lib/useActivities';

export default function MapTestPage() {
  const [center, setCenter] = useState<[number, number]>([-18.8792, 47.5079]); // Antananarivo default
  const { activities, loading, error, refetch } = useActivities(center[0], center[1]);

  const handleLocationFound = (lat: number, lon: number) => {
    setCenter([lat, lon]);
    refetch(lat, lon);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 bg-white shadow-md z-10">
        <h1 className="text-xl font-bold">ShuffleLife - Activity Map Test</h1>
        <p className="text-sm text-gray-500">
          Showing activities from OpenStreetMap (Overpass API)
        </p>
        <div className="mt-2 text-sm">
          {loading && <span className="text-blue-500">Loading activities...</span>}
          {error && <span className="text-red-500">Error: {error}</span>}
          {!loading && !error && (
            <span className="text-green-600 font-medium">Found {activities.length} activities</span>
          )}
        </div>
      </header>
      
      <main className="flex-1 relative">
        <Map 
          center={center} 
          zoom={15} 
          activities={activities} 
          onLocationFound={handleLocationFound}
        />
      </main>
    </div>
  );
}
