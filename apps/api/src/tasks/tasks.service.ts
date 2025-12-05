import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateTaskDto,
  UpdateTaskDto,
  ReorderTasksDto,
  CreateCommentDto,
  UpdateCommentDto,
} from "./dto/task.dto";

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée une nouvelle tâche
   */
  async create(dto: CreateTaskDto, userId: string) {
    // Vérifie l'accès au projet
    await this.checkProjectAccess(dto.projectId, userId);

    // Calcule l'ordre (dernière position)
    const lastTask = await this.prisma.task.findFirst({
      where: { projectId: dto.projectId, status: dto.status || "TODO" },
      orderBy: { order: "desc" },
    });

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        createdById: userId,
        status: dto.status || "TODO",
        priority: dto.priority || "MEDIUM",
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        estimatedHours: dto.estimatedHours,
        tags: dto.tags || [],
        order: lastTask ? lastTask.order + 1 : 0,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: { select: { comments: true } },
      },
    });

    return task;
  }

  /**
   * Récupère toutes les tâches d'un projet
   */
  async findByProject(projectId: string, userId: string) {
    await this.checkProjectAccess(projectId, userId);

    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: { select: { comments: true } },
      },
      orderBy: [{ status: "asc" }, { order: "asc" }],
    });
  }

  /**
   * Récupère les tâches assignées à l'utilisateur
   */
  async findMyTasks(userId: string) {
    return this.prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: {
          select: { id: true, name: true, slug: true, color: true },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        _count: { select: { comments: true } },
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    });
  }

  /**
   * Récupère une tâche par son ID
   */
  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        attachments: true,
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.checkProjectAccess(task.projectId, userId);

    return task;
  }

  /**
   * Met à jour une tâche
   */
  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.checkProjectAccess(task.projectId, userId);

    // Si le status passe à DONE, enregistre la date
    const completedAt =
      dto.status === "DONE" && task.status !== "DONE" ? new Date() : undefined;

    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate:
          dto.dueDate !== undefined
            ? dto.dueDate
              ? new Date(dto.dueDate)
              : null
            : undefined,
        startDate:
          dto.startDate !== undefined
            ? dto.startDate
              ? new Date(dto.startDate)
              : null
            : undefined,
        completedAt,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: { select: { comments: true } },
      },
    });
  }

  /**
   * Réordonne les tâches (pour le Kanban)
   */
  async reorder(dto: ReorderTasksDto, userId: string) {
    // Vérifie l'accès pour la première tâche
    if (dto.tasks.length > 0) {
      const firstTask = await this.prisma.task.findUnique({
        where: { id: dto.tasks[0].id },
      });
      if (firstTask) {
        await this.checkProjectAccess(firstTask.projectId, userId);
      }
    }

    // Met à jour toutes les tâches
    await Promise.all(
      dto.tasks.map((task) =>
        this.prisma.task.update({
          where: { id: task.id },
          data: {
            order: task.order,
            status: task.status,
          },
        }),
      ),
    );

    return { success: true };
  }

  /**
   * Supprime une tâche
   */
  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.checkProjectAccess(task.projectId, userId);

    return this.prisma.task.delete({
      where: { id },
    });
  }

  // --- Commentaires ---

  /**
   * Ajoute un commentaire à une tâche
   */
  async addComment(taskId: string, dto: CreateCommentDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.checkProjectAccess(task.projectId, userId);

    return this.prisma.taskComment.create({
      data: {
        content: dto.content,
        taskId,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  /**
   * Met à jour un commentaire
   */
  async updateComment(
    commentId: string,
    dto: UpdateCommentDto,
    userId: string,
  ) {
    const comment = await this.prisma.taskComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException("You can only edit your own comments");
    }

    return this.prisma.taskComment.update({
      where: { id: commentId },
      data: { content: dto.content },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  /**
   * Supprime un commentaire
   */
  async removeComment(commentId: string, userId: string) {
    const comment = await this.prisma.taskComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException("You can only delete your own comments");
    }

    return this.prisma.taskComment.delete({
      where: { id: commentId },
    });
  }

  /**
   * Vérifie l'accès au projet
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
}
