'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, LatLngTuple } from 'leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const customIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

interface Activity {
    id: string;
    name: string;
    category: string;
    type: string;
    location: {
        lat: number;
        lon: number;
    };
}

interface MapProps {
    center: LatLngTuple;
    zoom?: number;
    activities?: Activity[];
    onLocationFound?: (lat: number, lon: number) => void;
}

function LocationMarker({ onLocationFound }: { onLocationFound?: (lat: number, lon: number) => void }) {
    const map = useMap();

    useEffect(() => {
        map.locate().on('locationfound', function (e) {
            map.flyTo(e.latlng, map.getZoom());
            if (onLocationFound) onLocationFound(e.latlng.lat, e.latlng.lng);
        });
    }, [map, onLocationFound]);

    return null;
}

const MapInner = ({ center, zoom = 13, activities = [], onLocationFound }: MapProps) => {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Search user location on mount */}
            <LocationMarker onLocationFound={onLocationFound} />

            {activities.map((activity) => (
                <Marker
                    key={activity.id}
                    position={[activity.location.lat, activity.location.lon]}
                    icon={customIcon}
                >
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold text-sm">{activity.name}</h3>
                            <p className="text-xs text-gray-500 capitalize">{activity.category} - {activity.type}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapInner;
