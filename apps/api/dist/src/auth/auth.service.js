"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt = __importStar(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
let AuthService = class AuthService {
    prisma;
    googleClient;
    jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    constructor(prisma) {
        this.prisma = prisma;
        this.googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.API_URL || 'http://localhost:3001'}/auth/oauth/callback`);
    }
    async exchangeGoogleCode(code) {
        try {
            const { tokens } = await this.googleClient.getToken(code);
            if (!tokens.id_token) {
                throw new common_1.HttpException('No ID token received from Google', common_1.HttpStatus.UNAUTHORIZED);
            }
            const ticket = await this.googleClient.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new common_1.HttpException('Invalid token payload', common_1.HttpStatus.UNAUTHORIZED);
            }
            const user = await this.prisma.user.upsert({
                where: { email: payload.email },
                update: {
                    name: payload.name,
                    avatar: payload.picture,
                },
                create: {
                    email: payload.email,
                    name: payload.name || 'User',
                    avatar: payload.picture,
                    role: 'USER',
                },
            });
            const jwtToken = jwt.sign({
                sub: user.id,
                email: user.email,
                role: user.role,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            }, this.jwtSecret);
            return {
                token: jwtToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    picture: user.avatar,
                    role: user.role,
                },
            };
        }
        catch (error) {
            console.error('Google OAuth exchange error:', error);
            throw new common_1.HttpException('Failed to authenticate with Google', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async validateUser(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            const user = await this.prisma.user.findUnique({
                where: { id: decoded.sub },
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                userId: user.id,
                email: user.email,
                role: user.role,
                token,
            };
        }
        catch (error) {
            console.error('Token validation error:', error);
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map