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

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OsmService {
    private readonly logger = new Logger(OsmService.name);
    private readonly OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

    constructor(private prisma: PrismaService) { }

    async findNearbyActivities(lat: number, lon: number, radius: number = 1000): Promise<Activity[]> {
        // 1. Check for recent cached searches in this area
        const cachedSearch = await this.prisma.searchLog.findFirst({
            where: {
                latitude: {
                    gte: lat - 0.01, // Approx 1km lat
                    lte: lat + 0.01
                },
                longitude: {
                    gte: lon - 0.01,
                    lte: lon + 0.01
                },
                radius: {
                    gte: radius * 0.8 // If we have a search with similar or larger radius
                },
                createdAt: {
                    gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) // Last 30 days
                }
            }
        });

        if (cachedSearch) {
            this.logger.log('Cache hit! Fetching from DB.');
            // Fetch from Place table
            const places = await this.prisma.place.findMany({
                where: {
                    // Simple bounding box approximation for "nearby" in DB
                    latitude: { gte: lat - (radius / 111000), lte: lat + (radius / 111000) },
                    longitude: { gte: lon - (radius / (111000 * Math.cos(lat * Math.PI / 180))), lte: lon + (radius / (111000 * Math.cos(lat * Math.PI / 180))) }
                }
            });

            if (places.length > 0) {
                return places.map(p => ({
                    id: p.osmId,
                    name: p.name,
                    category: p.category,
                    type: p.type,
                    location: { lat: p.latitude, lon: p.longitude },
                    tags: (p.tags as any) || {},
                    website: p.website || undefined,
                    phone: p.phone || undefined,
                    opening_hours: p.opening_hours || undefined,
                    address: p.address ? { street: p.address } : undefined // Simplified
                }));
            }
        }

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
                return [];
            }

            const results = this.transformData(response.data.elements);

            // Async Cache (do not block)
            this.cacheResults(results).catch(err => this.logger.error('Cache error', err));

            return results;
        } catch (error) {
            this.logger.error('Error fetching from Overpass API', error.message);
            // Fallback to cache even if no search log?
            // For now, just throw or return empty
            throw new HttpException(
                'Failed to fetch nearby activities',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async saveActivities(userId: string, activities: Activity[]): Promise<number> {
        let count = 0;
        for (const act of activities) {
            try {
                // Avoid duplicates by checking osmId + userId combination
                const existing = await this.prisma.savedActivity.findFirst({
                    where: { userId, osmId: act.id }
                });

                if (!existing) {
                    await this.prisma.savedActivity.create({
                        data: {
                            userId,
                            osmId: act.id,
                            name: act.name,
                            type: act.type,
                            category: act.category,
                            latitude: act.location.lat,
                            longitude: act.location.lon,
                            address: [act.address?.housenumber, act.address?.street, act.address?.city].filter(Boolean).join(' ') || null,
                            website: act.website || null,
                            phone: act.phone || null,
                            opening_hours: act.opening_hours || null
                        }
                    });
                    count++;
                }
            } catch (error) {
                this.logger.error(`Failed to save activity ${act.id} for user ${userId}. Error: ${error.message}`, error.stack);
                console.error('Full Save Error:', JSON.stringify(error, null, 2));
            }
        }
        return count;
    }

    async getSavedActivities(userId: string) {
        return this.prisma.savedActivity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async shuffleActivity(userId: string) {
        const count = await this.prisma.savedActivity.count({
            where: { userId }
        });

        if (count === 0) return null;

        const skip = Math.floor(Math.random() * count);
        return this.prisma.savedActivity.findFirst({
            where: { userId },
            skip: skip
        });
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

    private async cacheResults(activities: Activity[]) {
        if (activities.length === 0) return;

        for (const act of activities) {
            try {
                await this.prisma.place.upsert({
                    where: { osmId: act.id },
                    update: {
                        updatedAt: new Date()
                    },
                    create: {
                        osmId: act.id,
                        name: act.name,
                        type: act.type,
                        category: act.category,
                        latitude: act.location.lat,
                        longitude: act.location.lon,
                        address: [act.address?.housenumber, act.address?.street, act.address?.city].filter(Boolean).join(' ') || null,
                        website: act.website || null,
                        phone: act.phone || null,
                        opening_hours: act.opening_hours || null,
                        tags: act.tags
                    }
                });
            } catch (err) {
                // ignore individual insert errors to prevent blocking the flow
                console.error(`Cache insert failed for ${act.id}:`, err.message);
            }
        }
    }
}

