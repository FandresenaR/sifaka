import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '../generated/client';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto): Promise<{
        project: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            status: import("../generated/client").$Enums.ProjectStatus;
            color: string | null;
            startDate: Date | null;
            endDate: Date | null;
            budget: number | null;
        };
        createdBy: {
            id: string;
            email: string;
            supabaseId: string | null;
            name: string | null;
            avatar: string | null;
            role: import("../generated/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        };
        assignee: {
            id: string;
            email: string;
            supabaseId: string | null;
            name: string | null;
            avatar: string | null;
            role: import("../generated/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import("../generated/client").$Enums.TaskStatus;
        startDate: Date | null;
        projectId: string;
        assigneeId: string | null;
        title: string;
        priority: import("../generated/client").$Enums.Priority;
        dueDate: Date | null;
        estimatedHours: number | null;
        actualHours: number | null;
        tags: string[];
        order: number;
        completedAt: Date | null;
        createdById: string;
    }>;
    findAll(projectId?: string, status?: TaskStatus): Promise<({
        project: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            status: import("../generated/client").$Enums.ProjectStatus;
            color: string | null;
            startDate: Date | null;
            endDate: Date | null;
            budget: number | null;
        };
        createdBy: {
            id: string;
            email: string;
            supabaseId: string | null;
            name: string | null;
            avatar: string | null;
            role: import("../generated/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        };
        assignee: {
            id: string;
            email: string;
            supabaseId: string | null;
            name: string | null;
            avatar: string | null;
            role: import("../generated/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        } | null;
        _count: {
            comments: number;
            attachments: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import("../generated/client").$Enums.TaskStatus;
        startDate: Date | null;
        projectId: string;
        assigneeId: string | null;
        title: string;
        priority: import("../generated/client").$Enums.Priority;
        dueDate: Date | null;
        estimatedHours: number | null;
        actualHours: number | null;
        tags: string[];
        order: number;
        completedAt: Date | null;
        createdById: string;
    })[]>;
    findOne(id: string): Promise<{
        comments: ({
            user: {
                id: string;
                email: string;
                supabaseId: string | null;
                name: string | null;
                avatar: string | null;
                role: import("../generated/client").$Enums.UserRole;
                createdAt: Date;
                updatedAt: Date;
                lastLoginAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            content: string;
            taskId: string;
        })[];
        project: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            status: import("../generated/client").$Enums.ProjectStatus;
            color: string | null;
            startDate: Date | null;
            endDate: Date | null;
            budget: number | null;
        };
        createdBy: {
            id: string;
            email: string;
            supabaseId: string | null;
            name: string | null;
            avatar: string | null;
            role: import("../generated/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        };
        assignee: {
            id: string;
            email: string;
            supabaseId: string | null;
            name: string | null;
            avatar: string | null;
            role: import("../generated/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        } | null;
        attachments: {
            id: string;
            createdAt: Date;
            taskId: string;
            filename: string;
            url: string;
            mimeType: string;
            size: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import("../generated/client").$Enums.TaskStatus;
        startDate: Date | null;
        projectId: string;
        assigneeId: string | null;
        title: string;
        priority: import("../generated/client").$Enums.Priority;
        dueDate: Date | null;
        estimatedHours: number | null;
        actualHours: number | null;
        tags: string[];
        order: number;
        completedAt: Date | null;
        createdById: string;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<{
        project: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            status: import("../generated/client").$Enums.ProjectStatus;
            color: string | null;
            startDate: Date | null;
            endDate: Date | null;
            budget: number | null;
        };
        createdBy: {
            id: string;
            email: string;
            supabaseId: string | null;
            name: string | null;
            avatar: string | null;
            role: import("../generated/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        };
        assignee: {
            id: string;
            email: string;
            supabaseId: string | null;
            name: string | null;
            avatar: string | null;
            role: import("../generated/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import("../generated/client").$Enums.TaskStatus;
        startDate: Date | null;
        projectId: string;
        assigneeId: string | null;
        title: string;
        priority: import("../generated/client").$Enums.Priority;
        dueDate: Date | null;
        estimatedHours: number | null;
        actualHours: number | null;
        tags: string[];
        order: number;
        completedAt: Date | null;
        createdById: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import("../generated/client").$Enums.TaskStatus;
        startDate: Date | null;
        projectId: string;
        assigneeId: string | null;
        title: string;
        priority: import("../generated/client").$Enums.Priority;
        dueDate: Date | null;
        estimatedHours: number | null;
        actualHours: number | null;
        tags: string[];
        order: number;
        completedAt: Date | null;
        createdById: string;
    }>;
    updateOrder(body: {
        projectId: string;
        tasks: {
            id: string;
            order: number;
        }[];
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import("../generated/client").$Enums.TaskStatus;
        startDate: Date | null;
        projectId: string;
        assigneeId: string | null;
        title: string;
        priority: import("../generated/client").$Enums.Priority;
        dueDate: Date | null;
        estimatedHours: number | null;
        actualHours: number | null;
        tags: string[];
        order: number;
        completedAt: Date | null;
        createdById: string;
    }[]>;
}
