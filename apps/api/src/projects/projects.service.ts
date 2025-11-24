import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateProjectDto) {
        return this.prisma.project.create({ data });
    }

    async findAll() {
        return this.prisma.project.findMany();
    }

    async findOne(id: string) {
        return this.prisma.project.findUnique({ where: { id } });
    }
}
