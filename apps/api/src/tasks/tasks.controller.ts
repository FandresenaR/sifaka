import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '../generated/client';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createTaskDto: CreateTaskDto) {
        // TODO: Get userId from JWT token after auth is implemented
        const userId = 'temp-user-id';
        return this.tasksService.create(createTaskDto, userId);
    }

    @Get()
    findAll(
        @Query('projectId') projectId?: string,
        @Query('status') status?: TaskStatus,
    ) {
        return this.tasksService.findAll(projectId, status);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.tasksService.update(id, updateTaskDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.tasksService.remove(id);
    }

    @Post('reorder')
    @HttpCode(HttpStatus.OK)
    updateOrder(
        @Body() body: { projectId: string; tasks: { id: string; order: number }[] },
    ) {
        return this.tasksService.updateOrder(body.projectId, body.tasks);
    }
}
