import { Test, TestingModule } from "@nestjs/testing";
import { ClientsService } from "./clients.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

const mockPrismaService = {
  client: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  projectMember: {
    findUnique: jest.fn(),
  },
};

describe("ClientsService", () => {
  let service: ClientsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a client without project", async () => {
      const dto = { name: "Test Client", email: "client@test.com" };
      const userId = "user-1";
      const mockClient = {
        id: "client-1",
        ...dto,
        createdById: userId,
      };

      prisma.client.create.mockResolvedValue(mockClient);

      const result = await service.create(dto, userId);

      expect(result).toEqual(mockClient);
      expect(prisma.client.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: dto.name,
            email: dto.email,
            createdById: userId,
          }),
        }),
      );
    });

    it("should create a client with project when user is member", async () => {
      const dto = {
        name: "Test Client",
        projectId: "project-1",
      };
      const userId = "user-1";

      prisma.projectMember.findUnique.mockResolvedValue({
        userId,
        role: "MEMBER",
      });
      prisma.client.create.mockResolvedValue({
        id: "client-1",
        ...dto,
        createdById: userId,
      });

      const result = await service.create(dto, userId);

      expect(prisma.projectMember.findUnique).toHaveBeenCalled();
      expect(result.projectId).toBe("project-1");
    });

    it("should throw ForbiddenException when user not in project", async () => {
      const dto = {
        name: "Test Client",
        projectId: "project-1",
      };

      prisma.projectMember.findUnique.mockResolvedValue(null);

      await expect(service.create(dto, "user-1")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("findAll", () => {
    it("should return clients for user", async () => {
      const userId = "user-1";
      const mockClients = [
        { id: "client-1", name: "Client 1" },
        { id: "client-2", name: "Client 2" },
      ];

      prisma.client.findMany.mockResolvedValue(mockClients);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockClients);
    });
  });

  describe("findOne", () => {
    it("should return client when user is creator", async () => {
      const userId = "user-1";
      const mockClient = {
        id: "client-1",
        name: "Test Client",
        createdById: userId,
        projectId: null,
      };

      prisma.client.findUnique.mockResolvedValue(mockClient);

      const result = await service.findOne("client-1", userId);

      expect(result).toEqual(mockClient);
    });

    it("should throw NotFoundException when client not found", async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      await expect(service.findOne("non-existent", "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when user has no access", async () => {
      const mockClient = {
        id: "client-1",
        name: "Test Client",
        createdById: "other-user",
        projectId: null,
      };

      prisma.client.findUnique.mockResolvedValue(mockClient);

      await expect(service.findOne("client-1", "user-1")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("search", () => {
    it("should search clients by query", async () => {
      const userId = "user-1";
      const mockClients = [{ id: "client-1", name: "John Doe" }];

      prisma.client.findMany.mockResolvedValue(mockClients);

      const result = await service.search("John", userId);

      expect(result).toEqual(mockClients);
    });
  });

  describe("remove", () => {
    it("should delete client when user has access", async () => {
      const userId = "user-1";
      const mockClient = {
        id: "client-1",
        createdById: userId,
        projectId: null,
      };

      prisma.client.findUnique.mockResolvedValue(mockClient);
      prisma.client.delete.mockResolvedValue(mockClient);

      const result = await service.remove("client-1", userId);

      expect(prisma.client.delete).toHaveBeenCalledWith({
        where: { id: "client-1" },
      });
    });
  });
});
