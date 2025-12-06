import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * Module Prisma
 * Utilise NeonService sous le capot pour la connexion à Neon
 * Fournit PrismaService pour compatibilité avec le code existant
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
