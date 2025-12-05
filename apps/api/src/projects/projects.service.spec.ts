import { Test, TestingModule } from "@nestjs/testing";
import { ProjectsService } from "./projects.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

const mockPrismaService = {
  project: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  projectMember: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe("ProjectsService", () => {
  let service: ProjectsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a project with user as owner", async () => {
      const dto = { name: "Test Project", description: "A test project" };
      const userId = "user-1";
      const mockProject = {
        id: "project-1",
        name: dto.name,
        slug: "test-project",
        description: dto.description,
        status: "ACTIVE",
        members: [{ userId, role: "OWNER" }],
        _count: { tasks: 0 },
      };

      prisma.project.findUnique.mockResolvedValue(null); // No existing slug
      prisma.project.create.mockResolvedValue(mockProject);

      const result = await service.create(dto, userId);

      expect(result).toEqual(mockProject);
      expect(prisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: dto.name,
            members: {
              create: {
                userId,
                role: "OWNER",
              },
            },
          }),
        }),
      );
    });
  });

  describe("findAll", () => {
    it("should return all projects for user", async () => {
      const userId = "user-1";
      const mockProjects = [
        { id: "project-1", name: "Project 1" },
        { id: "project-2", name: "Project 2" },
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockProjects);
      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            members: {
              some: { userId },
            },
          },
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should return project when user is member", async () => {
      const userId = "user-1";
      const mockProject = {
        id: "project-1",
        name: "Test Project",
        members: [{ userId, role: "MEMBER" }],
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findOne("project-1", userId);

      expect(result).toEqual(mockProject);
    });

    it("should throw NotFoundException when project not found", async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne("non-existent", "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when user is not member", async () => {
      const mockProject = {
        id: "project-1",
        name: "Test Project",
        members: [{ userId: "other-user", role: "OWNER" }],
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.findOne("project-1", "user-1")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("remove", () => {
    it("should delete project when user is owner", async () => {
      const userId = "user-1";
      prisma.projectMember.findUnique.mockResolvedValue({
        userId,
        role: "OWNER",
      });
      prisma.project.delete.mockResolvedValue({ id: "project-1" });

      const result = await service.remove("project-1", userId);

      expect(prisma.project.delete).toHaveBeenCalledWith({
        where: { id: "project-1" },
      });
    });

    it("should throw ForbiddenException when user is not owner", async () => {
      prisma.projectMember.findUnique.mockResolvedValue({
        userId: "user-1",
        role: "MEMBER",
      });

      await expect(service.remove("project-1", "user-1")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
