import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

export interface OverpassElement {
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: { [key: string]: string };
}

export interface Activity {
    id: string;
    name: string;
    category: string;
    type: string;
    location: {
        lat: number;
        lon: number;
    };
    tags: { [key: string]: string };
    website?: string;
    phone?: string;
    opening_hours?: string;
    address?: {
        street?: string;
        housenumber?: string;
        city?: string;
    };
}

@Injectable()
export class OsmService {
    private readonly logger = new Logger(OsmService.name);
    private readonly OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

    async findNearbyActivities(lat: number, lon: number, radius: number = 1000): Promise<Activity[]> {
        const query = `
      [out:json][timeout:60][maxsize:20000000];
      (
        node["leisure"](around:${radius},${lat},${lon});
        way["leisure"](around:${radius},${lat},${lon});
        relation["leisure"](around:${radius},${lat},${lon});
        
        node["tourism"](around:${radius},${lat},${lon});
        way["tourism"](around:${radius},${lat},${lon});
        relation["tourism"](around:${radius},${lat},${lon});
        
        node["sport"](around:${radius},${lat},${lon});
        way["sport"](around:${radius},${lat},${lon});
        
        node["historic"](around:${radius},${lat},${lon});
        way["historic"](around:${radius},${lat},${lon});
        
        node["man_made"](around:${radius},${lat},${lon});
        way["man_made"](around:${radius},${lat},${lon});

        node["military"](around:${radius},${lat},${lon});
        way["military"](around:${radius},${lat},${lon});

        node["club"](around:${radius},${lat},${lon});
        node["craft"](around:${radius},${lat},${lon});
        
        node["natural"="peak"](around:${radius},${lat},${lon});
        node["natural"="beach"](around:${radius},${lat},${lon});
        node["natural"="volcano"](around:${radius},${lat},${lon});
        node["natural"="cave_entrance"](around:${radius},${lat},${lon});
        node["waterway"="waterfall"](around:${radius},${lat},${lon});

        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        node["amenity"="cafe"](around:${radius},${lat},${lon});
        node["amenity"="bar"](around:${radius},${lat},${lon});
        node["amenity"="pub"](around:${radius},${lat},${lon});
        node["amenity"="cinema"](around:${radius},${lat},${lon});
        node["amenity"="theatre"](around:${radius},${lat},${lon});
        node["amenity"="nightclub"](around:${radius},${lat},${lon});
        node["amenity"="casino"](around:${radius},${lat},${lon});
        node["amenity"="stripclub"](around:${radius},${lat},${lon});
        node["amenity"="brothel"](around:${radius},${lat},${lon});
        node["amenity"="arts_centre"](around:${radius},${lat},${lon});
        node["amenity"="planetarium"](around:${radius},${lat},${lon});
        node["amenity"="place_of_worship"](around:${radius},${lat},${lon});
      );
      out center;
    `;

        try {
            this.logger.log(`Fetching activities from Overpass API for location: ${lat}, ${lon}`);
            const response = await axios.get(this.OVERPASS_API_URL, {
                params: { data: query },
            });

            if (!response.data || !response.data.elements) {
                this.logger.warn('No data returned from Overpass API');
                return [];
            }

            return this.transformData(response.data.elements);
        } catch (error) {
            this.logger.error('Error fetching data from Overpass API', error);
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'Overpass API Error',
                    message: error.message,
                    details: error.response?.data || 'No details',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private transformData(elements: OverpassElement[]): Activity[] {
        return elements
            .filter((el) => el.tags && (el.tags.name || el.tags.amenity || el.tags.leisure || el.tags.tourism))
            .map((el) => {
                const lat = el.lat || el.center?.lat || 0;
                const lon = el.lon || el.center?.lon || 0;

                let category = 'other';
                if (el.tags?.tourism) category = 'tourism';
                else if (el.tags?.leisure) category = 'leisure';
                else if (el.tags?.amenity) category = 'amenity';
                else if (el.tags?.sport) category = 'sport';
                else if (el.tags?.historic) category = 'historic';
                else if (el.tags?.natural) category = 'natural';
                else if (el.tags?.waterway) category = 'waterway';
                else if (el.tags?.man_made) category = 'man_made';
                else if (el.tags?.military) category = 'military';
                else if (el.tags?.club) category = 'club';
                else if (el.tags?.craft) category = 'craft';

                const type = el.tags?.[category] || 'unknown';
                const name = el.tags?.name || `${category} - ${type}`; // Fallback name if missing

                return {
                    id: `${el.type[0]}${el.id}`, // n123, w456
                    name,
                    category,
                    type,
                    location: { lat, lon },
                    tags: el.tags || {},
                    website: el.tags?.website || el.tags?.['contact:website'] || el.tags?.url,
                    phone: el.tags?.phone || el.tags?.['contact:phone'],
                    opening_hours: el.tags?.opening_hours,
                    address: {
                        street: el.tags?.['addr:street'],
                        housenumber: el.tags?.['addr:housenumber'],
                        city: el.tags?.['addr:city'],
                    }
                };
            });
    }
}
