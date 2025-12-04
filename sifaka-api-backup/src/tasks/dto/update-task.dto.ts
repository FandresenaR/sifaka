import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @IsOptional()
    @IsNumber()
    actualHours?: number;

    @IsOptional()
    @IsDateString()
    completedAt?: string;

    @IsOptional()
    @IsNumber()
    order?: number;
}
