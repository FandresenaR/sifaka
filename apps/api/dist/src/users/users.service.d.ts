import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        email: string;
        name: string | null;
        avatar: string | null;
        role: import("src/generated/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        avatar: string | null;
        role: import("src/generated/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
    } | null>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        avatar: string | null;
        role: import("src/generated/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
    } | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        name: string | null;
        avatar: string | null;
        role: import("src/generated/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        name: string | null;
    }>;
}
