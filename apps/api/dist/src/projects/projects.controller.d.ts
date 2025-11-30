import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        status: import("src/generated/client").$Enums.ProjectStatus;
        color: string | null;
        startDate: Date | null;
        endDate: Date | null;
        budget: number | null;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        status: import("src/generated/client").$Enums.ProjectStatus;
        color: string | null;
        startDate: Date | null;
        endDate: Date | null;
        budget: number | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        status: import("src/generated/client").$Enums.ProjectStatus;
        color: string | null;
        startDate: Date | null;
        endDate: Date | null;
        budget: number | null;
    } | null>;
}
