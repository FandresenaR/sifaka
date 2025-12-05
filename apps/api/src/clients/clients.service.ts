import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClientDto, UpdateClientDto } from "./dto/client.dto";

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée un nouveau client
   */
  async create(dto: CreateClientDto, userId: string) {
    // Si un projet est spécifié, vérifie l'accès
    if (dto.projectId) {
      await this.checkProjectAccess(dto.projectId, userId);
    }

    return this.prisma.client.create({
      data: {
        ...dto,
        createdById: userId,
      },
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  /**
   * Récupère tous les clients de l'utilisateur
   */
  async findAll(userId: string) {
    return this.prisma.client.findMany({
      where: {
        OR: [
          { createdById: userId },
          {
            project: {
              members: {
                some: { userId },
              },
            },
          },
        ],
      },
      include: {
        project: {
          select: { id: true, name: true, slug: true, color: true },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Récupère les clients d'un projet
   */
  async findByProject(projectId: string, userId: string) {
    await this.checkProjectAccess(projectId, userId);

    return this.prisma.client.findMany({
      where: { projectId },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Récupère un client par son ID
   */
  async findOne(id: string, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    if (!client) {
      throw new NotFoundException("Client not found");
    }

    // Vérifie l'accès
    const hasAccess = await this.checkClientAccess(client, userId);
    if (!hasAccess) {
      throw new ForbiddenException("You don't have access to this client");
    }

    return client;
  }

  /**
   * Met à jour un client
   */
  async update(id: string, dto: UpdateClientDto, userId: string) {
    const client = await this.findOne(id, userId);

    // Si on change le projet, vérifie l'accès au nouveau projet
    if (dto.projectId && dto.projectId !== client.project?.id) {
      await this.checkProjectAccess(dto.projectId, userId);
    }

    return this.prisma.client.update({
      where: { id },
      data: dto,
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  /**
   * Supprime un client
   */
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.client.delete({
      where: { id },
    });
  }

  /**
   * Recherche des clients
   */
  async search(query: string, userId: string) {
    return this.prisma.client.findMany({
      where: {
        AND: [
          {
            OR: [
              { createdById: userId },
              {
                project: {
                  members: {
                    some: { userId },
                  },
                },
              },
            ],
          },
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { company: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      include: {
        project: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
      take: 20,
    });
  }

  /**
   * Vérifie l'accès à un projet
   */
  private async checkProjectAccess(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (!member) {
      throw new ForbiddenException("You are not a member of this project");
    }

    return member;
  }

  /**
   * Vérifie si l'utilisateur a accès au client
   */
  private async checkClientAccess(
    client: { createdById: string; projectId: string | null },
    userId: string,
  ): Promise<boolean> {
    // L'utilisateur a créé le client
    if (client.createdById === userId) {
      return true;
    }

    // Le client appartient à un projet dont l'utilisateur est membre
    if (client.projectId) {
      const member = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: client.projectId, userId },
        },
      });
      return !!member;
    }

    return false;
  }
}
