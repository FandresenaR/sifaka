import { Module } from '@nestjs/common';
import { OsmController } from './osm.controller';
import { OsmService } from './osm.service';

@Module({
    controllers: [OsmController],
    providers: [OsmService],
    exports: [OsmService],
})
export class OsmModule { }
