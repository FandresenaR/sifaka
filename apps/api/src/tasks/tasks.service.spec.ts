import { Test, TestingModule } from "@nestjs/testing";
import { TasksService } from "./tasks.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

const mockPrismaService = {
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  taskComment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  projectMember: {
    findUnique: jest.fn(),
  },
};

describe("TasksService", () => {
  let service: TasksService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a task", async () => {
      const dto = {
        title: "Test Task",
        projectId: "project-1",
        description: "A test task",
      };
      const userId = "user-1";
      const mockTask = {
        id: "task-1",
        ...dto,
        createdById: userId,
        status: "TODO",
        priority: "MEDIUM",
      };

      prisma.projectMember.findUnique.mockResolvedValue({
        userId,
        role: "MEMBER",
      });
      prisma.task.findFirst.mockResolvedValue(null);
      prisma.task.create.mockResolvedValue(mockTask);

      const result = await service.create(dto, userId);

      expect(result).toEqual(mockTask);
      expect(prisma.task.create).toHaveBeenCalled();
    });

    it("should throw ForbiddenException when user not in project", async () => {
      const dto = {
        title: "Test Task",
        projectId: "project-1",
      };

      prisma.projectMember.findUnique.mockResolvedValue(null);

      await expect(service.create(dto, "user-1")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("findByProject", () => {
    it("should return tasks for a project", async () => {
      const projectId = "project-1";
      const userId = "user-1";
      const mockTasks = [
        { id: "task-1", title: "Task 1" },
        { id: "task-2", title: "Task 2" },
      ];

      prisma.projectMember.findUnique.mockResolvedValue({
        userId,
        role: "MEMBER",
      });
      prisma.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findByProject(projectId, userId);

      expect(result).toEqual(mockTasks);
    });
  });

  describe("findMyTasks", () => {
    it("should return tasks assigned to user", async () => {
      const userId = "user-1";
      const mockTasks = [
        { id: "task-1", title: "Task 1", assigneeId: userId },
        { id: "task-2", title: "Task 2", assigneeId: userId },
      ];

      prisma.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findMyTasks(userId);

      expect(result).toEqual(mockTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { assigneeId: userId },
        }),
      );
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      const taskId = "task-1";
      const userId = "user-1";
      const dto = { title: "Updated Task" };
      const mockTask = {
        id: taskId,
        projectId: "project-1",
        status: "TODO",
      };

      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.projectMember.findUnique.mockResolvedValue({
        userId,
        role: "MEMBER",
      });
      prisma.task.update.mockResolvedValue({ ...mockTask, ...dto });

      const result = await service.update(taskId, dto, userId);

      expect(result.title).toBe("Updated Task");
    });

    it("should throw NotFoundException when task not found", async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(
        service.update("non-existent", { title: "Test" }, "user-1"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("addComment", () => {
    it("should add a comment to a task", async () => {
      const taskId = "task-1";
      const userId = "user-1";
      const dto = { content: "Test comment" };
      const mockTask = { id: taskId, projectId: "project-1" };
      const mockComment = { id: "comment-1", ...dto, taskId, userId };

      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.projectMember.findUnique.mockResolvedValue({
        userId,
        role: "MEMBER",
      });
      prisma.taskComment.create.mockResolvedValue(mockComment);

      const result = await service.addComment(taskId, dto, userId);

      expect(result).toEqual(mockComment);
    });
  });

  describe("removeComment", () => {
    it("should delete own comment", async () => {
      const commentId = "comment-1";
      const userId = "user-1";
      const mockComment = { id: commentId, userId, content: "Test" };

      prisma.taskComment.findUnique.mockResolvedValue(mockComment);
      prisma.taskComment.delete.mockResolvedValue(mockComment);

      const result = await service.removeComment(commentId, userId);

      expect(prisma.taskComment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      });
    });

    it("should throw ForbiddenException when deleting other user comment", async () => {
      const mockComment = { id: "comment-1", userId: "other-user" };

      prisma.taskComment.findUnique.mockResolvedValue(mockComment);

      await expect(
        service.removeComment("comment-1", "user-1"),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
