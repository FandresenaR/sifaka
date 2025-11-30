import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientStatus } from '../generated/client';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createClientDto: CreateClientDto, userId: string): Promise<{
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
        } | null;
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
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("../generated/client").$Enums.ClientStatus;
        projectId: string | null;
        createdById: string;
        phone: string | null;
        company: string | null;
        position: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        website: string | null;
        notes: string | null;
    }>;
    findAll(projectId?: string, status?: ClientStatus): Promise<({
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
        } | null;
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
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("../generated/client").$Enums.ClientStatus;
        projectId: string | null;
        createdById: string;
        phone: string | null;
        company: string | null;
        position: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        website: string | null;
        notes: string | null;
    })[]>;
    findOne(id: string): Promise<{
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
        } | null;
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
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("../generated/client").$Enums.ClientStatus;
        projectId: string | null;
        createdById: string;
        phone: string | null;
        company: string | null;
        position: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        website: string | null;
        notes: string | null;
    }>;
    update(id: string, updateClientDto: UpdateClientDto): Promise<{
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
        } | null;
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
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("../generated/client").$Enums.ClientStatus;
        projectId: string | null;
        createdById: string;
        phone: string | null;
        company: string | null;
        position: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        website: string | null;
        notes: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("../generated/client").$Enums.ClientStatus;
        projectId: string | null;
        createdById: string;
        phone: string | null;
        company: string | null;
        position: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        website: string | null;
        notes: string | null;
    }>;
}
