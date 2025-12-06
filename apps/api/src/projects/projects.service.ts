import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddMemberDto,
  UpdateMemberRoleDto,
  MemberRole,
} from "./dto/project.dto";

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée un nouveau projet
   */
  async create(dto: CreateProjectDto, userId: string) {
    // Génère un slug unique
    const slug = await this.generateUniqueSlug(dto.name);

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        color: dto.color,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        budget: dto.budget,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: { select: { tasks: true } },
      },
    });

    return project;
  }

  /**
   * Récupère tous les projets de l'utilisateur
   */
  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: { select: { tasks: true, clients: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Récupère un projet par son ID
   */
  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: { select: { tasks: true, clients: true } },
      },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    // Vérifie que l'utilisateur est membre du projet
    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException("You are not a member of this project");
    }

    return project;
  }

  /**
   * Récupère un projet par son slug
   */
  async findBySlug(slug: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        tasks: {
          orderBy: { order: "asc" },
          include: {
            assignee: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: { select: { tasks: true, clients: true } },
      },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException("You are not a member of this project");
    }

    return project;
  }

  /**
   * Met à jour un projet
   */
  async update(id: string, dto: UpdateProjectDto, userId: string) {
    await this.checkProjectAccess(id, userId, ["OWNER", "ADMIN"]);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: { select: { tasks: true } },
      },
    });
  }

  /**
   * Supprime un projet
   */
  async remove(id: string, userId: string) {
    await this.checkProjectAccess(id, userId, ["OWNER"]);

    return this.prisma.project.delete({
      where: { id },
    });
  }

  /**
   * Ajoute un membre au projet
   */
  async addMember(projectId: string, dto: AddMemberDto, userId: string) {
    await this.checkProjectAccess(projectId, userId, ["OWNER", "ADMIN"]);

    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId: dto.userId,
        role: dto.role || "MEMBER",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  /**
   * Met à jour le rôle d'un membre
   */
  async updateMemberRole(
    projectId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
    userId: string,
  ) {
    await this.checkProjectAccess(projectId, userId, ["OWNER", "ADMIN"]);

    return this.prisma.projectMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  /**
   * Retire un membre du projet
   */
  async removeMember(projectId: string, memberId: string, userId: string) {
    await this.checkProjectAccess(projectId, userId, ["OWNER", "ADMIN"]);

    return this.prisma.projectMember.delete({
      where: { id: memberId },
    });
  }

  /**
   * Vérifie l'accès de l'utilisateur au projet
   */
  private async checkProjectAccess(
    projectId: string,
    userId: string,
    requiredRoles: string[],
  ) {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (!member) {
      throw new ForbiddenException("You are not a member of this project");
    }

    if (!requiredRoles.includes(member.role)) {
      throw new ForbiddenException(
        `Required role: ${requiredRoles.join(" or ")}`,
      );
    }

    return member;
  }

  /**
   * Génère un slug unique pour le projet
   */
  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
