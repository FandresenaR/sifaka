import { Controller, Get, Post, Body, Query, ParseFloatPipe, DefaultValuePipe, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OsmService, Activity } from './osm.service';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';

@Controller('activities')
export class OsmController {
    private readonly logger = new Logger(OsmController.name);

    constructor(
        private readonly osmService: OsmService,
        private readonly prisma: PrismaService,
    ) { }

    @Public() // Still allow public access, but log if user exists
    @Get('nearby')
    async getNearbyActivities(
        @Query('lat', ParseFloatPipe) lat: number,
        @Query('lon', ParseFloatPipe) lon: number,
        @Query('radius', new DefaultValuePipe(1000), ParseFloatPipe) radius: number,
        @CurrentUser() user?: User,
    ): Promise<Activity[]> {
        // Log search asynchronously to not block response
        this.logSearch(lat, lon, radius, user?.id).catch(err =>
            this.logger.error(`Failed to log search: ${err.message}`)
        );

        return this.osmService.findNearbyActivities(lat, lon, radius);
    }

    @Post('save')
    async saveActivities(
        @CurrentUser() user: User,
        @Body() activities: any[],
    ) {
        if (!user) {
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }

        const savedCount = await this.osmService.saveActivities(user.id, activities);
        return { message: 'Activities saved', count: savedCount };
    }

    @Get('saved')
    async getSavedActivities(@CurrentUser() user: User) {
        if (!user) {
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }
        return this.osmService.getSavedActivities(user.id);
    }

    @Get('shuffle')
    async shuffleActivity(@CurrentUser() user: User) {
        if (!user) {
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }
        return this.osmService.shuffleActivity(user.id);
    }

    private async logSearch(lat: number, lon: number, radius: number, userId?: string) {
        if (!userId) return; // Only log known users for now

        try {
            await this.prisma.searchLog.create({
                data: {
                    userId,
                    latitude: lat,
                    longitude: lon,
                    radius,
                    // country will be added later with reverse geocoding
                },
            });
        } catch (error) {
            this.logger.error('Error creating search log', error);
        }
    }
}
