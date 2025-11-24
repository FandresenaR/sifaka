import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    create(@Body() createProjectDto: { name: string; description?: string }) {
        return this.projectsService.create(createProjectDto);
    }

    @Get()
    findAll() {
        return this.projectsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }
}
