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
}

@Injectable()
export class OsmService {
    private readonly logger = new Logger(OsmService.name);
    private readonly OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

    async findNearbyActivities(lat: number, lon: number, radius: number = 1000): Promise<Activity[]> {
        const query = `
      [out:json][timeout:25];
      (
        node["leisure"](around:${radius},${lat},${lon});
        way["leisure"](around:${radius},${lat},${lon});
        relation["leisure"](around:${radius},${lat},${lon});
        node["tourism"](around:${radius},${lat},${lon});
        way["tourism"](around:${radius},${lat},${lon});
        relation["tourism"](around:${radius},${lat},${lon});
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        node["amenity"="cafe"](around:${radius},${lat},${lon});
        node["amenity"="bar"](around:${radius},${lat},${lon});
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

                const type = el.tags?.[category] || 'unknown';
                const name = el.tags?.name || `${category} - ${type}`; // Fallback name if missing

                return {
                    id: `${el.type[0]}${el.id}`, // n123, w456
                    name,
                    category,
                    type,
                    location: { lat, lon },
                    tags: el.tags || {},
                };
            });
    }
}
