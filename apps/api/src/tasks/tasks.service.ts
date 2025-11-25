import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '../generated/client';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async create(createTaskDto: CreateTaskDto, userId: string) {
        // Get the max order for tasks in this project
        const maxOrder = await this.prisma.task.aggregate({
            where: { projectId: createTaskDto.projectId },
            _max: { order: true },
        });

        return this.prisma.task.create({
            data: {
                ...createTaskDto,
                createdById: userId,
                order: (maxOrder._max.order || 0) + 1,
                dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
                startDate: createTaskDto.startDate ? new Date(createTaskDto.startDate) : null,
            },
            include: {
                assignee: true,
                createdBy: true,
                project: true,
            },
        });
    }

    async findAll(projectId?: string, status?: TaskStatus) {
        return this.prisma.task.findMany({
            where: {
                ...(projectId && { projectId }),
                ...(status && { status }),
            },
            include: {
                assignee: true,
                createdBy: true,
                project: true,
                _count: {
                    select: {
                        comments: true,
                        attachments: true,
                    },
                },
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' },
            ],
        });
    }

    async findOne(id: string) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                assignee: true,
                createdBy: true,
                project: true,
                comments: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                attachments: true,
            },
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        return task;
    }

    async update(id: string, updateTaskDto: UpdateTaskDto) {
        const task = await this.prisma.task.findUnique({ where: { id } });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        return this.prisma.task.update({
            where: { id },
            data: {
                ...updateTaskDto,
                dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
                startDate: updateTaskDto.startDate ? new Date(updateTaskDto.startDate) : undefined,
                completedAt: updateTaskDto.completedAt ? new Date(updateTaskDto.completedAt) : undefined,
            },
            include: {
                assignee: true,
                createdBy: true,
                project: true,
            },
        });
    }

    async remove(id: string) {
        const task = await this.prisma.task.findUnique({ where: { id } });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        return this.prisma.task.delete({ where: { id } });
    }

    async updateOrder(projectId: string, taskOrders: { id: string; order: number }[]) {
        // Update multiple tasks' order in a transaction
        const updates = taskOrders.map(({ id, order }) =>
            this.prisma.task.update({
                where: { id },
                data: { order },
            })
        );

        return this.prisma.$transaction(updates);
    }
}
