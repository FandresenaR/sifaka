import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Activity {
    id: string;
    name: string;
    category: string;
    type: string;
    location: {
        lat: number;
        lon: number;
    };
    tags: any;
}

export function useActivities(initialLat: number, initialLon: number, initialRadius: number = 1000) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = async (lat: number, lon: number, radius: number = 1000) => {
        setLoading(true);
        setError(null);
        try {
            // Ensure we point to the /api prefix
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

            console.log('Fetching activities from:', `${apiUrl}/activities/nearby`);

            const response = await axios.get(`${apiUrl}/activities/nearby`, {
                params: { lat, lon, radius },
            });
            setActivities(response.data);
        } catch (err: any) {
            console.error('Error fetching activities:', err);
            setError(err.message || 'Failed to fetch activities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialLat && initialLon) {
            fetchActivities(initialLat, initialLon, initialRadius);
        }
    }, [initialLat, initialLon]);

    return { activities, loading, error, refetch: fetchActivities };
}
