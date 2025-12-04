import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray } from 'class-validator';
import { TaskStatus, Priority } from '../../generated/client';

export class CreateTaskDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsEnum(Priority)
    @IsOptional()
    priority?: Priority;

    @IsString()
    projectId: string;

    @IsOptional()
    @IsString()
    assigneeId?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsNumber()
    estimatedHours?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
