import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { UnauthorizedException } from "@nestjs/common";

// Mock PrismaService
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe("AuthService", () => {
  let service: AuthService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("verifyToken", () => {
    it("should throw UnauthorizedException for invalid token", () => {
      expect(() => service.verifyToken("invalid-token")).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("getUserFromToken", () => {
    it("should throw UnauthorizedException for invalid token", async () => {
      await expect(service.getUserFromToken("invalid-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("getProfile", () => {
    it("should return user profile when user exists", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        avatar: null,
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile("user-1");

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
        select: expect.any(Object),
      });
    });

    it("should throw UnauthorizedException when user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile("non-existent")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
