import { TaskStatus, Priority } from '../../generated/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    projectId: string;
    assigneeId?: string;
    dueDate?: string;
    startDate?: string;
    estimatedHours?: number;
    tags?: string[];
}
