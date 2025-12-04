import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientStatus } from '../generated/client';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    async create(createClientDto: CreateClientDto, userId: string) {
        return this.prisma.client.create({
            data: {
                ...createClientDto,
                createdById: userId,
            },
            include: {
                project: true,
                createdBy: true,
            },
        });
    }

    async findAll(projectId?: string, status?: ClientStatus) {
        return this.prisma.client.findMany({
            where: {
                ...(projectId && { projectId }),
                ...(status && { status }),
            },
            include: {
                project: true,
                createdBy: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const client = await this.prisma.client.findUnique({
            where: { id },
            include: {
                project: true,
                createdBy: true,
            },
        });

        if (!client) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }

        return client;
    }

    async update(id: string, updateClientDto: UpdateClientDto) {
        const client = await this.prisma.client.findUnique({ where: { id } });

        if (!client) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }

        return this.prisma.client.update({
            where: { id },
            data: updateClientDto,
            include: {
                project: true,
                createdBy: true,
            },
        });
    }

    async remove(id: string) {
        const client = await this.prisma.client.findUnique({ where: { id } });

        if (!client) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }

        return this.prisma.client.delete({ where: { id } });
    }
}
