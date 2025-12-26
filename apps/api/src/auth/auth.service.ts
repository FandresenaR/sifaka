import { Injectable, UnauthorizedException } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";
import * as jwt from "jsonwebtoken";
import { PrismaService } from "../prisma/prisma.service";
import { GoogleAuthDto, LoginResponseDto } from "./dto/auth.dto";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn = "7d";

  constructor(private prisma: PrismaService) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    this.jwtSecret = process.env.JWT_SECRET || "fallback-secret-change-me";
  }

  /**
   * Authentification via Google OAuth
   */
  async googleLogin(dto: GoogleAuthDto): Promise<LoginResponseDto> {
    const googleUser = await this.verifyGoogleToken(dto.idToken);

    // Trouve ou crée l'utilisateur
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      // Crée un nouvel utilisateur
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
          supabaseId: googleUser.sub, // On réutilise ce champ pour le Google ID
          lastLoginAt: new Date(),
        },
      });
    } else {
      // Met à jour les infos et la dernière connexion
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name || googleUser.name,
          avatar: user.avatar || googleUser.picture,
          lastLoginAt: new Date(),
        },
      });
    }

    // Génère le JWT
    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }

  /**
   * Vérifie un token Google ID
   */
  private async verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException("Invalid Google token payload");
      }

      return {
        email: payload.email!,
        name: payload.name || "",
        picture: payload.picture || "",
        sub: payload.sub,
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid Google token");
    }
  }

  /**
   * Génère un JWT pour l'utilisateur
   */
  private generateToken(user: {
    id: string;
    email: string;
    role: string;
  }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  /**
   * Vérifie et décode un JWT
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  /**
   * Récupère l'utilisateur à partir du token
   */
  async getUserFromToken(token: string) {
    try {
      // 1. Try to verify as standard API JWT
      const payload = this.verifyToken(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (user) return user;
    } catch (jwtError) {
      // 2. If valid JWT but user not found, or invalid JWT, try Google ID Token
    }

    // 3. Try to verify as Google ID Token (from NextAuth session)
    try {
      const googleUser = await this.verifyGoogleToken(token);

      const user = await this.prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (user) return user;

      // Optional: Auto-create if not found (though NextAuth adapter should have handled it)
      // For safety, we can throw specific error if not found
    } catch (googleError) {
      // Both checks failed
      throw new UnauthorizedException("Invalid token (neither JWT nor Google ID Token)");
    }

    throw new UnauthorizedException("User not found");
  }

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }
}
