import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Initialiser PrismaClient avec la connexion Supabase
    super({
      log: [
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected to Supabase');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
