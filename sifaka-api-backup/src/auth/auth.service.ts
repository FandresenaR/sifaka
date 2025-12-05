import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

export interface IAuthService {
    validateUser(token: string): Promise<any>;
    exchangeGoogleCode(code: string): Promise<{ token: string; user: any }>;
}

@Injectable()
export class AuthService implements IAuthService {
    private googleClient: OAuth2Client;
    private jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    constructor(private prisma: PrismaService) {
        this.googleClient = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.API_URL || 'http://localhost:3001'}/auth/oauth/callback`,
        );
    }

    /**
     * Échange le code d'autorisation Google contre un token JWT
     */
    async exchangeGoogleCode(code: string): Promise<{ token: string; user: any }> {
        try {
            // Échange le code contre des tokens Google
            const { tokens } = await this.googleClient.getToken(code);

            if (!tokens.id_token) {
                throw new HttpException(
                    'No ID token received from Google',
                    HttpStatus.UNAUTHORIZED,
                );
            }

            // Vérifie et décode le token Google
            const ticket = await this.googleClient.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                throw new HttpException(
                    'Invalid token payload',
                    HttpStatus.UNAUTHORIZED,
                );
            }

            // Récupère ou crée l'utilisateur en base
            const user = await this.prisma.user.upsert({
                where: { email: payload.email! },
                update: {
                    name: payload.name,
                    avatar: payload.picture,
                },
                create: {
                    email: payload.email!,
                    name: payload.name || 'User',
                    avatar: payload.picture,
                    role: 'USER', // Rôle par défaut
                },
            });

            // Génère un JWT pour notre app
            const jwtToken = jwt.sign(
                {
                    sub: user.id,
                    email: user.email,
                    role: user.role,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 jours
                },
                this.jwtSecret,
            );

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
        } catch (error) {
            console.error('Google OAuth exchange error:', error);
            throw new HttpException(
                'Failed to authenticate with Google',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    /**
     * Valide un JWT token
     */
    async validateUser(token: string): Promise<any> {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as any;
            const user = await this.prisma.user.findUnique({
                where: { id: decoded.sub },
            });

            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return {
                userId: user.id,
                email: user.email,
                role: user.role,
                token,
            };
        } catch (error) {
            console.error('Token validation error:', error);
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
    }
}
