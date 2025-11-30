import { PrismaService } from '../prisma/prisma.service';
export interface IAuthService {
    validateUser(token: string): Promise<any>;
    exchangeGoogleCode(code: string): Promise<{
        token: string;
        user: any;
    }>;
}
export declare class AuthService implements IAuthService {
    private prisma;
    private googleClient;
    private jwtSecret;
    constructor(prisma: PrismaService);
    exchangeGoogleCode(code: string): Promise<{
        token: string;
        user: any;
    }>;
    validateUser(token: string): Promise<any>;
}
