import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import '../database/neon.config'; // Import de la configuration Neon pour activer WebSocket

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Créer le pool de connexion Neon avec WebSocket (port 443)
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Pool Neon étend pg.Pool et accepte une configuration PoolConfig
    const pool = new Pool({ connectionString: connectionString });

    // Créer l'adaptateur Neon pour Prisma
    const adapter = new PrismaNeon(pool);

    // Initialiser PrismaClient avec l'adaptateur Neon
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected via Neon WebSocket (port 443)');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
