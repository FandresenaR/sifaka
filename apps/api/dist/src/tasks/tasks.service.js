"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTaskDto, userId) {
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
    async findAll(projectId, status) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }
    async update(id, updateTaskDto) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
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
    async remove(id) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        return this.prisma.task.delete({ where: { id } });
    }
    async updateOrder(projectId, taskOrders) {
        const updates = taskOrders.map(({ id, order }) => this.prisma.task.update({
            where: { id },
            data: { order },
        }));
        return this.prisma.$transaction(updates);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map